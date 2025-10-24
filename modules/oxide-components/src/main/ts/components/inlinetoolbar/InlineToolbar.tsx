import { Arr, Id, Type } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';
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

import { useSpecialKeyNavigation } from '../../keynav/KeyboardNavigationHooks';

import type {
  InlineToolbarContextValue,
  InlineToolbarProps,
  TriggerProps,
  ToolbarProps
} from './InlineToolbarTypes';

const InlineToolbarContext = createContext<InlineToolbarContextValue | null>(null);

const useInlineToolbarContext = () => {
  const context = useContext(InlineToolbarContext);
  if (!Type.isNonNullable(context)) {
    throw new Error('useInlineToolbarContext must be used within an InlineToolbarProvider');
  }
  return context;
};

const Root: FC<InlineToolbarProps> = ({
  children,
  persistent = false
}) => {
  const [ isOpen, setIsOpen ] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const context = useMemo<InlineToolbarContextValue>(() => ({
    isOpen,
    open,
    close,
    triggerRef,
    toolbarRef,
    persistent

  }), [ isOpen, open, close, persistent ]);

  return (
    <InlineToolbarContext.Provider value={context}>
      {children}
    </InlineToolbarContext.Provider>
  );
};

const Trigger: FC<TriggerProps> = ({
  children,
  onClick,
  onMouseDown,
  ...rest
}) => {
  const { open, triggerRef } = useInlineToolbarContext();
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
  } = useInlineToolbarContext();

  useEffect(() => {
    if (isOpen && Type.isNonNullable(toolbarRef.current)) {
      toolbarRef.current.focus();
    }
  }, [ isOpen, toolbarRef ]);

  useEffect(() => {
    const element = toolbarRef.current;
    if (Type.isNonNullable(element)) {
      isOpen ? element.showPopover() : element.hidePopover();
    };
  }, [ isOpen, toolbarRef ]);

  useSpecialKeyNavigation({
    containerRef: toolbarRef,
    onEscape: close,
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

  const anchorName = useMemo(() => `--${Id.generate('inline-toolbar')}`, []);

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
      ? Css.get(sugarToolbar, '--inline-toolbar-gap') || '6px'
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

  const toolbarClasses = `tox-inline-toolbar${Type.isNonNullable(className) ? ` ${className}` : ''}`;

  return (
    <div
      ref={toolbarRef}
      popover='manual'
      tabIndex={-1}
      className={toolbarClasses}
      style={{
        ...style,
        visibility: isOpen ? undefined : 'hidden',
      }}
      onMouseDown={handleMouseDown}
      {...rest}
    >
      {children}
    </div>
  );
};

export {
  Root,
  Trigger,
  Toolbar
};
