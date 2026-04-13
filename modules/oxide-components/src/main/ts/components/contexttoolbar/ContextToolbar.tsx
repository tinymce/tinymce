import { Arr, Id, Optional, Type } from '@ephox/katamari';
import {
  Attribute,
  Compare,
  Css,
  Focus,
  PredicateFind,
  SelectorFind,
  Selectors,
  SugarElement,
  SugarNode,
  Traverse
} from '@ephox/sugar';
import {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
  type FC,
  useCallback,
  type MouseEventHandler
} from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';

import type { ContextToolbarContextValue, ContextToolbarProps, GroupProps, ToolbarHandle, ToolbarProps, TriggerProps } from './ContextToolbarTypes';

const ContextToolbarContext = createContext<ContextToolbarContextValue | null>(null);

const useContextToolbarContext = () => {
  const context = useContext(ContextToolbarContext);
  if (!Type.isNonNullable(context)) {
    throw new Error('useContextToolbarContext must be used within a ContextToolbarProvider');
  }
  return context;
};

const defaultToolbarGap = '6px';
const toolbarControlSelectors = [ 'button', '[role="button"]', '.tox-button' ];
const toolbarControlSelector = toolbarControlSelectors.join(', ');
const enabledToolbarControlSelector =
  Arr.map(toolbarControlSelectors,
    (selector) => `${selector}:not([disabled]):not([aria-disabled="true"])`).join(', ');

const isEnabledAndTabbable = (elem: SugarElement<HTMLElement>): boolean =>
  !Attribute.has(elem, 'disabled')
  && Attribute.get(elem, 'aria-disabled') !== 'true'
  && elem.dom.tabIndex >= 0;

const focusablePredicate = (selector: string) => (elem: SugarElement<Node>): elem is SugarElement<HTMLElement> =>
  SugarNode.isHTMLElement(elem)
  && Selectors.is(elem, selector)
  && isEnabledAndTabbable(elem);

const isFocusableControl = focusablePredicate(toolbarControlSelector);

const isFirstFocusableInClosestAncestor = (
  elem: SugarElement<HTMLElement>,
  ancestorSelector: string
): boolean =>
  SelectorFind.closest(elem, ancestorSelector).map((ancestor) =>
    PredicateFind.descendant(ancestor, isFocusableControl).exists((firstMatch) => Compare.eq(firstMatch, elem))
  ).getOr(true);

const focusFirstEnabledControl = (toolbar: HTMLElement) => {
  const sugarToolbar = SugarElement.fromDom(toolbar);
  PredicateFind.descendant(sugarToolbar, isFocusableControl).fold(() => Focus.focus(sugarToolbar), Focus.focus);
};

const Root: FC<ContextToolbarProps> = ({
  children,
  persistent = false,
  anchorRef,
  usePopover = false
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
    persistent,
    usePopover
  }), [ isOpen, openToolbar, closeToolbar, persistent, anchorRef, getAnchorElement, usePopover ]);

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

const Toolbar = forwardRef<ToolbarHandle, ToolbarProps>(({
  children,
  onMouseDown,
  onEscape: passedOnEscape
}, ref) => {
  const {
    isOpen,
    toolbarRef,
    triggerRef,
    getAnchorElement,
    close,
    persistent,
    usePopover
  } = useContextToolbarContext();

  useImperativeHandle(ref, () => ({
    focus: () => {
      Optional.from(toolbarRef.current).each(focusFirstEnabledControl);
    }
  }), [ toolbarRef ]);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (Type.isNullable(toolbar)) {
      return;
    }
    if (!isOpen) {
      if (usePopover) {
        toolbar.hidePopover();
      }
      return;
    }

    if (usePopover) {
      toolbar.showPopover();
    }
    // Defer focus using queueMicrotask to ensure it runs after
    // the Popover API's internal focus management is complete
    window.queueMicrotask(() => {
      focusFirstEnabledControl(toolbar);
    });
  }, [ usePopover, isOpen, toolbarRef ]);

  const onEscape = useMemo(() => {
    if (persistent) {
      return passedOnEscape;
    }
    if (Type.isNullable(passedOnEscape)) {
      return close;
    }
    return () => {
      passedOnEscape();
      close();
    };
  }, [ persistent, passedOnEscape, close ]);

  // Handle Escape key to close (unless persistent={true})
  KeyboardNavigationHooks.useSpecialKeyNavigation({
    containerRef: toolbarRef,
    ...(Type.isNonNullable(onEscape) ? { onEscape } : { })
  });

  KeyboardNavigationHooks.useTabKeyNavigation({
    containerRef: toolbarRef,
    selector: toolbarControlSelector,
    useTabstopAt: (elem) => isFirstFocusableInClosestAncestor(elem, '.tox-toolbar__group'),
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
      popover={usePopover ? 'manual' : undefined}
      tabIndex={-1}
      className='tox-context-toolbar'
      style={{
        visibility: isOpen ? undefined : 'hidden',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div role='toolbar' className='tox-toolbar'>
        {children}
      </div>
    </div>
  );
});

const Group: FC<GroupProps> = ({ children }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: groupRef,
    selector: enabledToolbarControlSelector,
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
