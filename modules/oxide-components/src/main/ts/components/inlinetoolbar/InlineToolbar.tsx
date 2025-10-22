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
import { createPortal } from 'react-dom';

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
  sinkRef,
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
    sinkRef,
    persistent
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- sinkRef/triggerRef/toolbarRef are stable ref objects and don't need to be in deps list. */
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
    sinkRef,
    triggerRef,
    close,
    persistent
  } = useInlineToolbarContext();

  useEffect(() => {
    if (isOpen && Type.isNonNullable(toolbarRef.current)) {
      toolbarRef.current.focus();
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps -- toolbarRef is a stable ref object and doesn't need to be in deps list. */
  }, [ isOpen ]);

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
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- toolbarRef/triggerRef are stable ref objects */
  }, [ isOpen, close ]);

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
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- triggerRef/toolbarRef are stable ref objects */
  }, [ anchorName, isOpen ]);

  const handleMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault();
    onMouseDown?.(event);
  }, [ onMouseDown ]);

  const toolbarClasses = [ 'tox-inline-toolbar', className ]
    .filter(Boolean)
    .join(' ');

  return (
    isOpen &&
    Type.isNonNullable(sinkRef.current) &&
    Type.isNonNullable(triggerRef.current)
      ? createPortal(
        <div
          ref={toolbarRef}
          tabIndex={-1}
          className={toolbarClasses}
          style={style}
          onMouseDown={handleMouseDown}
          {...rest}
        >
          {children}
        </div>,
        sinkRef.current
      ) : null
  );
};

export {
  Root,
  Trigger,
  Toolbar
};
