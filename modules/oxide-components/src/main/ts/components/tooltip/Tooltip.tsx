import { Fun, Type } from '@ephox/katamari';
import { Bem } from 'oxide-components/main';
import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type FC, type PropsWithChildren, type ReactNode } from 'react';

interface TooltipState {
  readonly isOpen: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly contentRef: React.RefObject<HTMLDivElement | null>;
  readonly triggerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const defaultState: TooltipState = {
  isOpen: false,
  delayForShow: 300,
  delayForHide: 100,
  setIsOpen: Fun.noop,
  contentRef: { current: null },
  triggerRef: { current: null },
};

const TooltipContext = createContext<TooltipState>(defaultState);

const Trigger: FC<PropsWithChildren> = ({ children }) => {
  const { setIsOpen, triggerRef } = useContext(TooltipContext);

  const onMouseEnter = useCallback(() => {
    setIsOpen(true);
  }, [ setIsOpen ]);

  const onMouseLeave = useCallback(() => {
    setIsOpen(false);
  }, [ setIsOpen ]);

  const onFocus = onMouseEnter;
  const onBlur = onMouseLeave;

  const count = Children.count(children);
  if (count === 0) {
    throw new Error('Tooltip Trigger must have a child element');
  }
  // Clone the child element and inject event handlers
  const theChild = Children.count(children) === 1 ? children : (children as ReactNode[])[0];
  if (!isValidElement(theChild)) {
    return null;
  }

  return cloneElement(theChild, {
    ref: (el: HTMLDivElement | null) => {
      // Only forward non-null values to preserve the child's ref during React's cleanup phase
      if (el !== null) {
        triggerRef.current = el;
        // TODO: Remove this cast weirdness once we migrate to react 19
        const childWithRef = theChild as React.ReactElement & { ref?: React.RefCallback<HTMLDivElement> | React.MutableRefObject<HTMLDivElement> };
        if (Type.isFunction(childWithRef.ref)) {
          childWithRef.ref(el);
        } else if (Type.isNonNullable(childWithRef.ref) && !Type.isString(childWithRef.ref)) {
          childWithRef.ref.current = el;
        }
      }
    },
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
  });
};

interface ContentProps {
  text: string;
}

const Content: FC<ContentProps> = ({ text }) => {
  const { isOpen, contentRef, triggerRef, delayForShow, delayForHide } = useContext(TooltipContext);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      contentRef.current.style.display = 'inline-block';
      contentRef.current.style.height = 'fit-content';
      contentRef.current.style.top = `${triggerRect.top + triggerRect.height}px`;
      contentRef.current.style.position = 'fixed';
      const contentRect = contentRef.current.getBoundingClientRect();
      contentRef.current.style.left = `${triggerRect.left - contentRect.width / 2 + triggerRect.width / 2}px`;
    }
  }, [ contentRef, triggerRef ]);

  useLayoutEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.showPopover();
          updatePosition();
        }
      }, delayForShow);
      return () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      };
    } else if (!isOpen && contentRef.current) {
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.display = 'none';
          contentRef.current.hidePopover();
        }
      }, delayForHide);
      return () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      };
    } else {
      return Fun.noop;
    }
  }, [ isOpen, contentRef, updatePosition, delayForShow, delayForHide ]);

  return (
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
    <div ref={contentRef} popover='hint' className={Bem.block('tox-tooltip', {
      up: true
    })}>
      <div className={Bem.element('tox-tooltip', 'body')}>{text}</div>
    </div>
  );
};

const Root: FC<PropsWithChildren> = ({ children }) => {
  const [ state, setState ] = useState({
    isOpen: false,
    delayForShow: 300,
    delayForHide: 100,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const setIsOpen = useCallback((isOpen: boolean) => {
    setState((prevState) => ({ ...prevState, isOpen }));
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    setIsOpen,
    contentRef,
    triggerRef
  }), [ state, setIsOpen ]);

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

export {
  Content,
  Root,
  Trigger
};
