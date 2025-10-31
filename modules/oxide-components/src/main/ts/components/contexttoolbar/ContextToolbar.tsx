import { Arr, Id, Optional, Type } from '@ephox/katamari';
import { Class, Css, Focus, SelectorFilter, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';
import {
  createContext,
  useContext,
  useRef,
  useState,
  useMemo,
  useEffect,
  type FC,
  useCallback,
  type MouseEventHandler
} from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';

import type { ContextToolbarContextValue, ContextToolbarProps, GroupProps, ToolbarProps, TriggerProps } from './ContextToolbarTypes';

const ContextToolbarContext = createContext<ContextToolbarContextValue | null>(null);

const useContextToolbarContext = () => {
  const context = useContext(ContextToolbarContext);
  if (!Type.isNonNullable(context)) {
    throw new Error('useContextToolbarContext must be used within a ContextToolbarProvider');
  }
  return context;
};

const defaultToolbarGap = '6px';

const Root: FC<ContextToolbarProps> = ({
  children,
  persistent = false,
  anchorRef,
  open: controlledOpen
}) => {
  const [ internalOpen, setInternalOpen ] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen ?? internalOpen;

  const open = useCallback(() => setInternalOpen(true), []);
  const close = useCallback(() => setInternalOpen(false), []);

  const context = useMemo<ContextToolbarContextValue>(() => ({
    isOpen,
    open,
    close,
    triggerRef,
    toolbarRef,
    anchorRef,
    persistent

  }), [ isOpen, open, close, persistent, anchorRef ]);

  return (
    <ContextToolbarContext.Provider value={context}>
      {children}
    </ContextToolbarContext.Provider>
  );
};

const Trigger: FC<TriggerProps> = ({
  children,
  onClick,
  onMouseDown
}) => {
  const { open, triggerRef } = useContextToolbarContext();
  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    open();
    onClick?.(event);
  }, [ open, onClick ]);
  const handleMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault();
    onMouseDown?.(event);
  }, [ onMouseDown ]);
  return (
    <div
      ref={triggerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

const Toolbar: FC<ToolbarProps> = ({
  children,
  onMouseDown
}) => {
  const {
    isOpen,
    toolbarRef,
    triggerRef,
    anchorRef,
    close,
    persistent
  } = useContextToolbarContext();

  useEffect(() => {
    const element = toolbarRef.current;
    if (Type.isNonNullable(element)) {
      if (isOpen) {
        element.showPopover();
        // Defer focus using queueMicrotask to ensure it runs after
        // the Popover API's internal focus management is complete
        window.queueMicrotask(() => {
          const sugarElement = SugarElement.fromDom(element);
          const firstGroup = SelectorFind.descendant(sugarElement, '.tox-toolbar__group');
          const firstButton = firstGroup.bind((group) =>
            SelectorFind.descendant(group, 'button, [role="button"]')
          );

          firstButton.fold(
            () => element.focus(), // Falls back to container if no button found
            (button) => Focus.focus(button as SugarElement<HTMLElement>) // Focus first button
          );
        });
      } else {
        element.hidePopover();
      }
    };
  }, [ isOpen, toolbarRef ]);

  // Handle Escape key to close (unless persistent={true})
  KeyboardNavigationHooks.useSpecialKeyNavigation({
    containerRef: toolbarRef,
    onEscape: persistent ? undefined : close,
  });

  KeyboardNavigationHooks.useTabKeyNavigation({
    containerRef: toolbarRef,
    selector: 'button, .tox-button',
    useTabstopAt: (elem) => {
      // Only stop at the first button in each group
      return Traverse.parent(elem)
        .filter((parent) => Class.has(parent, 'tox-toolbar__group'))
        .map((parent) => {
          const buttons = SelectorFilter.descendants(parent, 'button, .tox-button');
          return buttons.length > 0 && buttons[0].dom === elem.dom;
        })
        .getOr(true);
    },
    cyclic: true
  });

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      isOpen &&
      Type.isNonNullable(toolbarRef.current) &&
      event.target instanceof Node
    ) {
      const clickedToolbar = toolbarRef.current.contains(event.target);
      const clickedTrigger = triggerRef.current?.contains(event.target) ?? false;
      const clickedAnchor = anchorRef?.current?.contains(event.target) ?? false;
      if (!clickedToolbar && !clickedTrigger && !clickedAnchor) {
        close();
      }
    }
  }, [ isOpen, close, toolbarRef, triggerRef, anchorRef ]);

  useEffect(() => {
    if (persistent) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ persistent, handleClickOutside ]);

  const anchorName = useMemo(() => `--${Id.generate('context-toolbar')}`, []);

  useEffect(() => {
    const trigger = anchorRef?.current ?? triggerRef.current;
    const toolbar = toolbarRef.current;
    if (!isOpen || !Type.isNonNullable(trigger) || !Type.isNonNullable(toolbar)) {
      return;
    }

    const anchorElement = Optional.from(anchorRef?.current)
      .orThunk(() =>
        Optional.from(trigger.firstElementChild)
          .filter((child) => child instanceof window.HTMLElement)
          .map((child) => child as HTMLElement)
      )
      .getOr(trigger);

    const sugarAnchor = SugarElement.fromDom(anchorElement);
    const sugarToolbar = SugarElement.fromDom(toolbar);

    Css.set(sugarAnchor, 'anchor-name', anchorName);
    Css.set(sugarToolbar, 'position', 'absolute');
    Css.set(sugarToolbar, 'margin', '0');
    Css.set(sugarToolbar, 'inset', 'unset');
    Css.set(sugarToolbar, 'position-anchor', anchorName);

    const topValue = `calc(anchor(${anchorName} bottom) + ${defaultToolbarGap})`;
    const leftValue = `anchor(${anchorName} center)`;

    Css.set(sugarToolbar, 'top', topValue);
    Css.set(sugarToolbar, 'left', leftValue);

    Css.set(sugarToolbar, 'position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline');

    return () => {
      Css.remove(sugarAnchor, 'anchor-name');
      Arr.each([ 'position', 'margin', 'inset', 'position-anchor', 'top', 'left', 'position-try-fallbacks' ], (property) => {
        Css.remove(sugarToolbar, property);
      });
    };
  }, [ anchorName, isOpen, triggerRef, toolbarRef, anchorRef ]);

  const handleMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    onMouseDown?.(event);
  }, [ onMouseDown ]);

  return (
    <div
      ref={toolbarRef}
      // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+ (TINY-13129)
      popover='manual'
      tabIndex={-1}
      className='tox-context-toolbar'
      style={{
        visibility: isOpen ? undefined : 'hidden',
      }}
      onMouseDown={handleMouseDown}
    >
      <div role='toolbar' className='tox-toolbar'>
        {children}
      </div>
    </div>
  );
};

const Group: FC<GroupProps> = ({ children }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: groupRef,
    selector: 'button, .tox-button',
    execute: (focused) => {
      focused.dom.click();
      return Optional.some(true);
    }
  });

  return (
    <div
      ref={groupRef}
      role='group'
      className='tox-toolbar__group'
    >
      {children}
    </div>
  );
};

export {
  Root,
  Trigger,
  Toolbar,
  Group
};
