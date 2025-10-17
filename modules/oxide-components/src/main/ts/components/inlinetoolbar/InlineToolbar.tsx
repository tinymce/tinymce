/* eslint-disable react-refresh/only-export-components */
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

import * as KeyMatch from '../../keynav/keyboard/KeyMatch';
import * as Keys from '../../keynav/keyboard/Keys';

import type {
  InlineToolbarContextValue,
  InlineToolbarProps,
  TriggerProps,
  ToolbarProps
} from './InlineToolbarTypes';

const InlineToolbarContext = createContext<InlineToolbarContextValue | null>(null);

const useInlineToolbarContext = () => {
  const context = useContext(InlineToolbarContext);
  if (!context) {
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (KeyMatch.inSet(Keys.ESCAPE)(event) && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ isOpen, close ]);

  useEffect(() => {
    if (persistent) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
                Type.isNonNullable(toolbarRef.current) &&
                Type.isNonNullable(triggerRef.current)
      ) {
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const { clientX, clientY } = event;

        const clickedToolbar =
                    clientX >= toolbarRect.left &&
                    clientX <= toolbarRect.right &&
                    clientY >= toolbarRect.top &&
                    clientY <= toolbarRect.bottom;

        const clickedTrigger =
                    clientX >= triggerRect.left &&
                    clientX <= triggerRect.right &&
                    clientY >= triggerRect.top &&
                    clientY <= triggerRect.bottom;

        if (!clickedToolbar && !clickedTrigger) {
          close();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ isOpen, close, toolbarRef, triggerRef, persistent ]);

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

export const InlineToolbar = {
  Root,
  Trigger,
  Toolbar
};