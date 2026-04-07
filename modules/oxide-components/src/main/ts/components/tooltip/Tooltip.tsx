import { Fun, Id, Type } from '@ephox/katamari';
import { Bem } from 'oxide-components/main';
import { Children, cloneElement, createContext, forwardRef, isValidElement, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type FC, type HTMLAttributes, type PropsWithChildren, type ReactNode } from 'react';

interface RootProps extends PropsWithChildren {
  readonly showCondition?: 'always' | 'overflow';
}

import { DropdownContext } from '../dropdown/internals/Context.ts';

interface TooltipState {
  readonly isOpen: boolean;
  readonly renderComponents: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly setRenderComponents: (isOpen: boolean) => void;
  readonly contentRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly triggerRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly showCondition: 'always' | 'overflow';
  readonly popupAnchor: string;
}

const defaultState: TooltipState = {
  isOpen: false,
  renderComponents: true,
  delayForShow: 300,
  delayForHide: 100,
  setIsOpen: Fun.noop,
  showCondition: 'always',
  setRenderComponents: Fun.noop,
  contentRef: { current: null },
  triggerRef: { current: null },
  popupAnchor: '--tooltip-anchor' // this is wrong, but I don't have time to rewrite context today
};

const TooltipContext = createContext<TooltipState>(defaultState);

interface TriggerInternalProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> { }

const isOverflowing = (element: HTMLElement) => (element.offsetWidth < element.scrollWidth);

const TriggerImpl = forwardRef<HTMLElement, TriggerInternalProps>(({ children, ...props }, ref) => {
  const { renderComponents, setIsOpen, showCondition, triggerRef, setRenderComponents, popupAnchor } = useContext(TooltipContext);

  const shouldRender = () => {
    if (showCondition === 'overflow') {
      const trigger = triggerRef.current;

      return Type.isNonNullable(trigger) && isOverflowing(trigger);
    }

    return true;
  };

  useLayoutEffect(() => {
    const rerender = shouldRender();
    if (renderComponents === rerender) {
      return;
    }
    setRenderComponents(rerender);
  }, [renderComponents, showCondition, setRenderComponents]);

  useEffect(() => {
    const handleResize = () => {
      const rerender = shouldRender();
      if (renderComponents === rerender) {
        return;
      }
      setRenderComponents(rerender);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderComponents, showCondition, setRenderComponents]);

  const count = Children.count(children);
  if (count === 0) {
    throw new Error('Tooltip Trigger must have a child element');
  }
  // Clone the child element and inject event handlers
  const theChild = Children.count(children) === 1 ? children : (children as ReactNode[])[0];
  if (!isValidElement(theChild)) {
    return null;
  }

  const refCallback = (el: HTMLDivElement | null) => {
    // Only forward non-null values to internal refs to preserve state during React's cleanup phase
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
    // Always forward to the consumer's ref, including null for proper cleanup
    if (Type.isFunction(ref)) {
      ref(el);
    } else if (Type.isNonNullable(ref)) {
      ref.current = el;
    }
  };

  if (renderComponents) {
    return cloneElement(theChild, {
      ...props,
      style: {
        ...theChild.props.style,
        anchorName: popupAnchor
      },
      ref: refCallback,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        if (!e.isDefaultPrevented()) {
          theChild.props.onMouseEnter?.(e);
          props.onMouseEnter?.(e);
          setIsOpen(true);
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        if (!e.isDefaultPrevented()) {
          theChild.props.onMouseLeave?.(e);
          props.onMouseLeave?.(e);
          setIsOpen(false);
        }
      },
      // TODO: Disabled render on focus for now see #TINY-14178
      // onFocus: (e: React.FocusEvent<HTMLElement>) => {
      //   if (!e.isDefaultPrevented()) {
      //     theChild.props.onFocus?.(e);
      //     props.onFocus?.(e);
      //     setIsOpen(true);
      //   }
      // },
      // onBlur: (e: React.FocusEvent<HTMLElement>) => {
      //   if (!e.isDefaultPrevented()) {
      //     theChild.props.onBlur?.(e);
      //     props.onBlur?.(e);
      //     setIsOpen(false);
      //   }
      // },
    });
  } else {
    return cloneElement(theChild, {
      ...props,
      ref: refCallback,
    });
  }
});

const Trigger: React.ForwardRefExoticComponent<
  PropsWithChildren & React.RefAttributes<HTMLElement>
> = TriggerImpl;

interface ContentProps {
  readonly text: string;
}

const showContentPopover = (content: HTMLElement) => {
  content.style.display = 'inline-block';

  content.showPopover();
};

const hideContentPopover = (content: HTMLElement) => {
  content.hidePopover();
  content.style.display = '';
};

const Content = forwardRef<HTMLDivElement, ContentProps>(({ text }, ref) => {
  const { renderComponents, isOpen, contentRef, triggerRef, delayForShow, delayForHide, popupAnchor } = useContext(TooltipContext);

  useLayoutEffect(() => {
    if (Type.isNonNullable(contentRef.current)) {
      const content = contentRef.current;
      if (isOpen) {
        const timeoutId = setTimeout(() => showContentPopover(content), delayForShow);
        return () => {
          clearTimeout(timeoutId);
        };
      } else {
        const timeoutId = setTimeout(() => hideContentPopover(content), delayForHide);
        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [ renderComponents, isOpen, contentRef, triggerRef, delayForShow, delayForHide ]);

  if (!renderComponents) {
    return null;
  }

  return (
    <div ref={(el: HTMLDivElement) => {
      contentRef.current = el;
      if (Type.isFunction(ref)) {
        ref(el);
      } else if (Type.isNonNullable(ref)) {
        ref.current = el;
      }
    }}
    popover='manual'
    className={Bem.block('tox-tooltip', { up: true, anchor: true })}
    style={{
      // @ts-expect-error We should remove this expect error once we've migrated to React 19 and can use the new popover API types
      positionAnchor: popupAnchor
    }}
    >
      <div className={Bem.element('tox-tooltip', 'body')}>{text}</div>
    </div>
  );
});

const Root: FC<RootProps> = ({ children, showCondition }) => {
  const [ state, setState ] = useState({
    isOpen: false,
    renderComponents: true,
    delayForShow: 300,
    delayForHide: 100,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const setIsOpen = useCallback((isOpen: boolean) => {
    setState((prevState) => ({ ...prevState, isOpen }));
  }, []);

  const setRenderComponents = useCallback((renderComponents: boolean) => {
    if (renderComponents) {
      setState((prevState) => ({ ...prevState, isOpen: false, renderComponents }));
    } else {
      setState((prevState) => ({ ...prevState, renderComponents }));
    }
  }, []);
  const context = useContext(DropdownContext);
  const popupAnchor = useMemo(() => {
    if (context !== null) {
      // if the tooltip is in a dropdown context, use the dropdown anchor that's already on the trigger instead of overwriting it
      return context.popupAnchor;
    } else {
      return `--${Id.generate('tooltip')}`;
    }
  // generate one ID per trigger/content combination, not every time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ context, triggerRef, contentRef ]);
  const contextValue = useMemo(() => {
    return ({
      ...state,
      setIsOpen,
      contentRef,
      triggerRef,
      showCondition: showCondition || 'always',
      setRenderComponents,
      popupAnchor
    });
  }, [ state, setIsOpen, popupAnchor ]);

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

export {
  Content,
  Root,
  Trigger
};
