import { Fun, Type } from '@ephox/katamari';
import { Bem } from '@tinymce/oxide-components';
import { cloneElement, createContext, createRef, useCallback, useContext, useLayoutEffect, useState, type FunctionComponent, type PropsWithChildren, type ReactNode } from 'react';

interface TooltipState {
  readonly isOpen: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly contentRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly triggerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const defaultState: TooltipState = {
  isOpen: false,
  delayForShow: 300,
  delayForHide: 100,
  setIsOpen: Fun.noop,
  contentRef: createRef<HTMLDivElement | null>() as React.MutableRefObject<HTMLDivElement | null>,
  triggerRef: createRef<HTMLDivElement | null>() as React.MutableRefObject<HTMLDivElement | null>,
};

const TooltipContext = createContext<TooltipState>(defaultState);

const Trigger: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { setIsOpen, triggerRef } = useContext(TooltipContext);

  const onMouseEnter = useCallback(() => {
    setIsOpen(true);
  }, [ setIsOpen ]);

  const onMouseLeave = useCallback(() => {
    setIsOpen(false);
  }, [ setIsOpen ]);

  const onFocus = onMouseEnter;
  const onBlur = onMouseLeave;

  // Clone the child element and inject event handlers
  const child: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> = Array.isArray(children) ? children[ 0 ] : children;

  if (!child) {
    return null;
  }

  return cloneElement(child, {
    ref: (el: HTMLDivElement) => { 
        triggerRef.current = el;
        if (Type.isFunction(child.ref)) {
          child.ref(el);
        } else if (Type.isNonNullable(child.ref) && !Type.isString(child.ref)) {
          child.ref.current = el;
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

const Content: FunctionComponent<ContentProps> = ({ text }) => {
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
    <div ref={contentRef} popover='hint' className={Bem.block('tox-tooltip', { // Seems like popover will be available with React 19 ( we got 18 )
      up: true
    })}>
      <div className={Bem.element('tox-tooltip', 'body')}>{text}</div>
    </div>
  );
};

const Root: FunctionComponent<{ children: ReactNode[] | ReactNode }> = ({ children }) => {
  const [ state, setState ] = useState({
    isOpen: false,
    delayForShow: 300,
    delayForHide: 100,
  });
  const contentRef = createRef<HTMLDivElement>();
  const triggerRef = createRef<HTMLDivElement>();

  const setIsOpen = (isOpen: boolean) => {
    setState({ ...state, isOpen });
  };
  return <TooltipContext.Provider value={{ ...state, setIsOpen, contentRef, triggerRef }}>{children}</TooltipContext.Provider>;
};

export {
  Content,
  Root,
  Trigger
};
