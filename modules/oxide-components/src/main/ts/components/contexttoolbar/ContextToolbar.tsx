import { Arr, Id, Optional, Type } from '@ephox/katamari';
import { Class, Css, Focus, SelectorFilter, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
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
  anchorRef
}) => {
  const [ isOpen, setIsOpen ] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const openToolbar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeToolbar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const getAnchorElement = useCallback((): HTMLElement | null => {
    // Prefer anchorRef.current if provided
    return Optional.from(anchorRef?.current)
      .orThunk(() => {
        // Otherwise, try to get first child of trigger, or fall back to trigger itself
        return Optional.from(triggerRef.current)
          .map(SugarElement.fromDom)
          .bind(Traverse.firstChild)
          .filter(SugarNode.isHTMLElement)
          .map((child) => child.dom)
          .orThunk(() => Optional.from(triggerRef.current));
      })
      .getOrNull();
  }, [ anchorRef, triggerRef ]);

  // Auto-open when mounting with anchorRef (no Trigger)
  // Since component remounts when anchorRef changes, we can read it directly
  useEffect(() => {
    const anchor = getAnchorElement();
    if (Type.isNonNullable(anchor) && !Type.isNonNullable(triggerRef.current)) {
      // Use requestAnimationFrame to ensure anchor is ready and allow Trigger to mount first
      const rafId = window.requestAnimationFrame(() => {
        if (!Type.isNonNullable(triggerRef.current)) {
          setIsOpen(true);
        }
      });

      return () => window.cancelAnimationFrame(rafId);
    }
  }, [ getAnchorElement, triggerRef ]);

  useEffect(() => {
    const anchor = getAnchorElement();
    if (Type.isNonNullable(anchor)) {
      const handleAnchorClick = () => {
        openToolbar();
      };

      anchor.addEventListener('click', handleAnchorClick);
      return () => {
        anchor.removeEventListener('click', handleAnchorClick);
      };
    }
  }, [ getAnchorElement, openToolbar ]);

  const context = useMemo<ContextToolbarContextValue>(() => ({
    isOpen,
    open: openToolbar,
    close: closeToolbar,
    triggerRef,
    toolbarRef,
    anchorRef,
    anchorElement: getAnchorElement(),
    getAnchorElement,
    persistent
  }), [ isOpen, openToolbar, closeToolbar, persistent, anchorRef, getAnchorElement ]);

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
    getAnchorElement,
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
      const anchor = getAnchorElement();
      const clickedAnchor = anchor?.contains(event.target) ?? false;
      if (!clickedToolbar && !clickedTrigger && !clickedAnchor) {
        close();
      }
    }
  }, [ isOpen, close, toolbarRef, triggerRef, getAnchorElement ]);

  useEffect(() => {
    if (persistent) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ persistent, handleClickOutside ]);

  const anchorName = useMemo(() => `--${Id.generate('context-toolbar')}`, []);

  useEffect(() => {
    const anchorElement = getAnchorElement();
    const toolbar = toolbarRef.current;
    if (!isOpen || !Type.isNonNullable(anchorElement) || !Type.isNonNullable(toolbar)) {
      return;
    }

    const sugarAnchor = SugarElement.fromDom(anchorElement);
    const sugarToolbar = SugarElement.fromDom(toolbar);

    Css.set(sugarAnchor, 'anchor-name', anchorName);
    Css.set(sugarToolbar, 'position', 'absolute');
    Css.set(sugarToolbar, 'margin', '0');
    Css.set(sugarToolbar, 'inset', 'unset');
    Css.set(sugarToolbar, 'position-anchor', anchorName);

    const topValue = `calc(anchor(${anchorName} bottom) + ${defaultToolbarGap})`;

    Css.set(sugarToolbar, 'top', topValue);
    Css.set(sugarToolbar, 'justify-self', 'anchor-center');
    Css.set(sugarToolbar, 'position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline');

    return () => {
      Css.remove(sugarAnchor, 'anchor-name');
      Arr.each([ 'position', 'margin', 'inset', 'position-anchor', 'top', 'justify-self', 'position-try-fallbacks' ], (property) => {
        Css.remove(sugarToolbar, property);
      });
    };
  }, [ anchorName, isOpen, toolbarRef, getAnchorElement ]);

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
