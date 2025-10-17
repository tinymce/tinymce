import { Type } from '@ephox/katamari';
import {
  createContext,
  useContext,
  useRef,
  useState,
  useMemo,
  useEffect,
  type FC,
  useCallback
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

const Trigger: FC<TriggerProps> = ({ children }) => {
  const { open, triggerRef } = useInlineToolbarContext();
  return (
    <div
      ref={triggerRef}
      onClick={open}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

const Toolbar: FC<ToolbarProps> = ({
  children
}) => {
  const {
    isOpen,
    toolbarRef,
    sinkRef,
    triggerRef,
    close,
    persistent
  } = useInlineToolbarContext();

  // Focus toolbar when it opens to enable keyboard navigation
  useEffect(() => {
    if (isOpen && toolbarRef.current) {
      toolbarRef.current.focus();
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps -- toolbarRef is a stable ref object and doesn't need to be in deps list. */
  }, [ isOpen ]);

  // Handle Escape key via keyboard navigation hook
  useSpecialKeyNavigation({
    containerRef: toolbarRef,
    onEscape: close,
  });

  // Handle click outside to close toolbar (unless persistent)
  useEffect(() => {
    if (persistent) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- toolbarRef/triggerRef are stable ref objects and don't need to be in deps list. */
  }, [ isOpen, close, persistent ]);

  const getPosition = (sink: HTMLDivElement, trigger: HTMLDivElement) => {
    const sinkRect = sink.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();

    // Calculate trigger's position relative to the sink
    const top = triggerRect.bottom - sinkRect.top;
    const left = triggerRect.left - sinkRect.left;

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  };

  return (
    isOpen &&
    Type.isNonNullable(sinkRef.current) &&
    Type.isNonNullable(triggerRef.current)
      ? createPortal(
        <div
          ref={toolbarRef}
          tabIndex={-1}
          style={{
            ...getPosition(sinkRef.current, triggerRef.current),
            position: 'absolute',
            display: 'flex',
            gap: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '9px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            padding: '4px'
          }}
          onMouseDown={(event) => event.preventDefault()}
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