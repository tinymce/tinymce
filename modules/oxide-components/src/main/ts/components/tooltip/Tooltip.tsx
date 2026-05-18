import { Arr, Id, Type } from '@ephox/katamari';
import { PredicateExists, SugarElement, SugarNode } from '@ephox/sugar';
import { Bem } from 'oxide-components/main';
import {
  Children, cloneElement, forwardRef, isValidElement, useCallback,
  useContext,
  useLayoutEffect, useMemo, useRef, useState, type FC, type HTMLAttributes,
  type PropsWithChildren, type ReactNode
} from 'react';

import { DropdownContext } from '../dropdown/internals/Context';

import { TooltipContext, useTooltip } from './internals/Context';

interface RootProps extends PropsWithChildren {
  readonly showCondition?: 'always' | 'overflow';
}

interface TriggerInternalProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> { }

// Certain elements have an offsetWidth that is 1px larger than scrollWidth even
// when content fits. Treat that case as non-overflowing.
const isOverflowing = (element: HTMLElement) => (element.offsetWidth + 1 < element.scrollWidth);

const isOverflowingDeep = (root: HTMLElement) =>
  isOverflowing(root) || PredicateExists.child(SugarElement.fromDom(root),
    (child) => SugarNode.isHTMLElement(child) && isOverflowing(child.dom));

const TriggerImpl = forwardRef<HTMLElement, TriggerInternalProps>(({ children, ...props }, ref) => {
  const { setIsOpen, showCondition, triggerRef, setCanShow, popupAnchor } = useTooltip();

  useLayoutEffect(() => {
    if (showCondition === 'always') {
      setCanShow(true);
      return;
    }

    const trigger = triggerRef.current;
    if (Type.isNullable(trigger)) {
      return;
    }

    const recomputeCanShow = () => setCanShow(isOverflowingDeep(trigger));

    let observedChildren: Element[] = [];
    const resizeObserver = new window.ResizeObserver(recomputeCanShow);
    resizeObserver.observe(trigger);

    // Children of the trigger can resize without resizing the trigger itself
    // (e.g. when the trigger has overflow: hidden). Observe each child too, and
    // resync whenever the child set changes so newly-added children are tracked.
    const observeChildren = () => {
      Arr.each(observedChildren, (child) => resizeObserver.unobserve(child));
      observedChildren = Array.from(trigger.children);
      Arr.each(observedChildren, (child) => resizeObserver.observe(child));
    };
    observeChildren();
    recomputeCanShow();

    const mutationObserver = new window.MutationObserver(() => {
      observeChildren();
      recomputeCanShow();
    });
    mutationObserver.observe(trigger, { childList: true, subtree: true, characterData: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ showCondition, triggerRef, setCanShow ]);

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

  return cloneElement(theChild, {
    ...props,
    style: {
      ...theChild.props.style,
      anchorName: popupAnchor
    },
    ref: refCallback,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      theChild.props.onMouseEnter?.(e);
      props.onMouseEnter?.(e);
      if (!e.isDefaultPrevented()) {
        setIsOpen(true);
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      theChild.props.onMouseLeave?.(e);
      props.onMouseLeave?.(e);
      if (!e.isDefaultPrevented()) {
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
  const { canShow, isOpen, contentRef, delayForShow, delayForHide, popupAnchor } = useTooltip();

  useLayoutEffect(() => {
    if (!canShow) {
      return;
    }
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
  }, [ canShow, isOpen, contentRef, delayForShow, delayForHide ]);

  if (!canShow) {
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

const Root: FC<RootProps> = ({ children, showCondition = 'always' }) => {
  const [ state, setState ] = useState({
    isOpen: false,
    canShow: showCondition === 'always',
    delayForShow: 300,
    delayForHide: 100,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const setIsOpen = useCallback((isOpen: boolean) => {
    setState((prevState) => ({ ...prevState, isOpen }));
  }, []);

  const setCanShow = useCallback((canShow: boolean) => {
    setState((prevState) => {
      if (prevState.canShow === canShow) {
        return prevState;
      }
      // When transitioning to "cannot show", also clear isOpen so that a later
      // transition back to canShow=true does not pick up stale open state.
      return canShow
        ? { ...prevState, canShow }
        : { ...prevState, canShow, isOpen: false };
    });
  }, []);

  const dropdownContext = useContext(DropdownContext);
  const popupAnchor = useMemo(() => {
    if (Type.isNonNullable(dropdownContext)) {
      // if the tooltip is in a dropdown context, use the dropdown anchor that's already on the trigger instead of overwriting it
      return dropdownContext.popupAnchor;
    } else {
      return `--${Id.generate('tooltip')}`;
    }
  // generate one ID per trigger/content combination, not every time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ dropdownContext, triggerRef, contentRef ]);

  const contextValue = useMemo(() => {
    return ({
      ...state,
      setIsOpen,
      setCanShow,
      contentRef,
      triggerRef,
      showCondition,
      popupAnchor
    });
  }, [ state, setIsOpen, setCanShow, popupAnchor, showCondition ]);

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

export {
  Content,
  Root,
  Trigger
};
