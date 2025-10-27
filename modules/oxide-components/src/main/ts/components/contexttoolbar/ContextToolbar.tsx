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

const Root: FC<ContextToolbarProps> = ({
  children,
  persistent = false
}) => {
  const [ isOpen, setIsOpen ] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const context = useMemo<ContextToolbarContextValue>(() => ({
    isOpen,
    open,
    close,
    triggerRef,
    toolbarRef,
    persistent

  }), [ isOpen, open, close, persistent ]);

  return (
    <ContextToolbarContext.Provider value={context}>
      {children}
    </ContextToolbarContext.Provider>
  );
};

const Trigger: FC<TriggerProps> = ({
  children,
  onClick,
  onMouseDown,
  ...rest
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
      {...rest}
    >
      {children}
    </div>
  );
};

const Toolbar: FC<ToolbarProps> = ({
  children,
  style,
  className,
  onMouseDown,
  ...rest
}) => {
  const {
    isOpen,
    toolbarRef,
    triggerRef,
    close,
    persistent
  } = useContextToolbarContext();

  const popoverMode = persistent ? 'manual' : 'auto';

  useEffect(() => {
    const element = toolbarRef.current;
    if (Type.isNonNullable(element)) {
      if (isOpen) {
        element.showPopover();
        // Defer focus to next event loop tick to ensure
        // it runs after Popover API's focus management
        setTimeout(() => {
          const sugarElement = SugarElement.fromDom(element);
          const firstGroup = SelectorFind.descendant(sugarElement, '.tox-toolbar__group');
          const firstButton = firstGroup.bind((group) =>
            SelectorFind.descendant(group, 'button, [role="button"]')
          );

          firstButton.fold(
            () => element.focus(), // Falls back to container if no button found
            (button) => Focus.focus(button as SugarElement<HTMLElement>) // Focus first button
          );
        }, 0);
      } else {
        element.hidePopover();
      }
    };
  }, [ isOpen, toolbarRef ]);

  // Listen for popover auto-dismiss (e.g. when user presses Escape)
  // and sync our state
  useEffect(() => {
    const element = toolbarRef.current;
    if (Type.isNonNullable(element)) {
      const handleToggle = (event: Event) => {
        const toggleEvent = event as ToggleEvent;
        if (toggleEvent.newState === 'closed' && isOpen) {
          close();
        }
      };
      element.addEventListener('toggle', handleToggle);
      return () => element.removeEventListener('toggle', handleToggle);
    }
  }, [ isOpen, close, toolbarRef ]);

  // Only allow Escape to close if not `persistent={true}`
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
      Type.isNonNullable(triggerRef.current) &&
      event.target instanceof Node
    ) {
      const clickedToolbar = toolbarRef.current.contains(event.target);
      const clickedTrigger = triggerRef.current.contains(event.target);
      if (!clickedToolbar && !clickedTrigger) {
        close();
      }
    }
  }, [ isOpen, close, toolbarRef, triggerRef ]);

  useEffect(() => {
    if (persistent) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ persistent, handleClickOutside ]);

  const anchorName = useMemo(() => `--${Id.generate('context-toolbar')}`, []);

  useEffect(() => {
    if (!isOpen || !Type.isNonNullable(triggerRef.current) || !Type.isNonNullable(toolbarRef.current)) {
      return;
    }

    const trigger = triggerRef.current;
    const toolbar = toolbarRef.current;
    const anchorElement = (trigger.firstElementChild as HTMLElement) ?? trigger;

    const sugarAnchor = SugarElement.fromDom(anchorElement);
    const sugarToolbar = SugarElement.fromDom(toolbar);

    Css.set(sugarAnchor, 'anchor-name', anchorName);
    Css.set(sugarToolbar, 'position-anchor', anchorName);

    const gap = Type.isNonNullable(toolbar.ownerDocument?.defaultView)
      ? Css.get(sugarToolbar, '--context-toolbar-gap') || '6px'
      : '6px';

    const topValue = `calc(anchor(${anchorName} bottom) + ${gap})`;
    const leftValue = `anchor(${anchorName} left)`;

    Css.set(sugarToolbar, 'top', topValue);
    Css.set(sugarToolbar, 'left', leftValue);

    Css.set(sugarToolbar, 'position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline');

    return () => {
      Css.remove(sugarAnchor, 'anchor-name');
      Arr.each([ 'position-anchor', 'top', 'left', 'position-try-fallbacks' ], (property) => {
        Css.remove(sugarToolbar, property);
      });
    };
  }, [ anchorName, isOpen, triggerRef, toolbarRef ]);

  const handleMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault();
    onMouseDown?.(event);
  }, [ onMouseDown ]);

  const toolbarClasses = `tox-context-toolbar${Type.isNonNullable(className) ? ` ${className}` : ''}`;

  return (
    <div
      ref={toolbarRef}
      // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+ (TINY-13129)
      popover={popoverMode}
      tabIndex={-1}
      className={toolbarClasses}
      style={{
        ...style,
        visibility: isOpen ? undefined : 'hidden',
      }}
      onMouseDown={handleMouseDown}
    >
      <div role='toolbar' className='tox-toolbar' {...rest}>
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
