import { Throttler, Type } from '@ephox/katamari';
import { Children, cloneElement, forwardRef, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type FC, type HTMLAttributes, type MouseEvent, type PropsWithChildren, type ReactElement, type KeyboardEvent } from 'react';

import { Bem } from '../../main';

import { DropdownContext, useDropdown } from './internals/Context';
import * as PositioningUtils from './internals/PositioningUtils';

const isInDropdownContent = (contentRef: React.MutableRefObject<HTMLDivElement | undefined>, node: Node): boolean => {
  return contentRef.current?.contains(node) ?? false;
};

interface DropdownContentProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  readonly onOpenChange?: (isOpen: boolean) => void;
}

const Content = forwardRef<HTMLDivElement, DropdownContentProps>(({ children, onOpenChange, ...props }, ref) => {
  const { triggerRef, side, align, gap, contentRef, triggerEvents, debouncedHideHoverablePopover, isOpen, setIsOpen } = useDropdown();

  const updateToggleState = useCallback((event: ToggleEvent) => {
    setIsOpen(event.newState === 'open');
  }, [ setIsOpen ]);

  useEffect(() => {
    const element = contentRef.current;
    if (Type.isNullable(element)) {
      return;
    }
    const onToggle = (e: Event) => {
      updateToggleState(e as ToggleEvent);
      if ((e as ToggleEvent).newState === 'closed') {
        // Only refocus trigger if focus was inside the dropdown content or nothing is focused
        // This prevents stealing focus from other elements (like sibling menu items)
        const focusWasInContent = contentRef.current?.contains(document.activeElement);
        if (focusWasInContent || document.activeElement === document.body) {
          triggerRef.current?.focus();
        }
        onOpenChange?.(false);
      } else {
        onOpenChange?.(true);
      }
    };

    element.addEventListener('toggle', onToggle);

    return () => {
      element.removeEventListener('toggle', onToggle);
    };
  }, [ contentRef, triggerRef, updateToggleState, onOpenChange ]);

  const onHoverTriggerProps = {
    onMouseLeave: (e: MouseEvent<HTMLDivElement>) => {
      props.onMouseLeave?.(e);
      debouncedHideHoverablePopover.throttle(e);
    },
    onMouseEnter: (e: MouseEvent<HTMLDivElement>) => {
      props.onMouseEnter?.(e);
      debouncedHideHoverablePopover.cancel();
    }
  };

  const onArrowTriggerProps = {
    onKeyUp: (e: KeyboardEvent<HTMLDivElement>) => {
      props.onKeyUp?.(e);
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        contentRef.current?.hidePopover();
      }
    }
  };

  const contentProps = {
    ...props,
    ...triggerEvents.includes('hover') && onHoverTriggerProps,
    ...triggerEvents.includes('arrows') && onArrowTriggerProps,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(e);
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        contentRef.current?.hidePopover();
      }
    }
  };
  const insetProps = PositioningUtils.getInset(side, gap);
  const area = PositioningUtils.getPositionArea(side, align);
  return <div
    popover='auto'
    className={Bem.block('tox-dropdown-content')}
    ref={(el: HTMLDivElement) => {
      contentRef.current = el;
      if (Type.isFunction(ref)) {
        ref(el);
      } else if (Type.isNonNullable(ref)) {
        ref.current = el;
      }
    }}
    { ...contentProps }
    style={{
      ...insetProps,
      // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
      positionArea: area,
    }}
  >
    {isOpen && children}
  </div>;
});

interface TriggerInternalProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> {}

const TriggerImpl = forwardRef<HTMLElement, TriggerInternalProps>(({ children, ...props }, ref) => {
  const { triggerRef, contentRef, triggerEvents, debouncedHideHoverablePopover, isOpen } = useDropdown();

  let child = Children.toArray(children)[0];
  if (!isValidElement(child)) {
    return null;
  }
  child = child as ReactElement;

  const showContentPopover = () => {
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
    contentRef.current?.showPopover({
      // specifying the source sets up an implicit `anchor` relationship
      source: triggerRef.current
    });
  };

  const onHoverTriggerProps = {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      if (!e.isDefaultPrevented()) {
        child.props.onMouseEnter?.(e);
        props.onMouseEnter?.(e);
        debouncedHideHoverablePopover.cancel();
        if (!isOpen) {
          showContentPopover();
        }
      }
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      if (!e.isDefaultPrevented()) {
        child.props.onMouseLeave?.(e);
        props.onMouseLeave?.(e);
        debouncedHideHoverablePopover.throttle(e);
      }
    }
  };

  const onClickTriggerProps = {
    onClick: (e: MouseEvent<HTMLElement>) => {
      if (!e.isDefaultPrevented()) {
        child.props.onClick?.(e);
        props.onClick?.(e);
        if (isOpen) {
          contentRef.current?.hidePopover();
        } else {
          showContentPopover();
        }
      }
    }
  };

  const onArrowTriggerProps = {
    onKeyUp: (e: KeyboardEvent) => {
      child.props.onKeyUp?.(e);
      if (e.key === 'ArrowRight' && !isOpen) {
        showContentPopover();
      }
    }
  };

  return cloneElement(child, {
    ...props,
    ref: (el: HTMLElement) => {
      triggerRef.current = el;
      if (Type.isFunction(child.props.ref)) {
        child.props.ref(el);
      } else if (Type.isNonNullable(child.props.ref)) {
        child.props.ref.current = el;
      }
      // TODO: This needs to changes once we upgrade to react 19
      // @ts-expect-error This is needed because preact sets the ref on the child object not on its props
      if (Type.isFunction(child.ref)) {
        // @ts-expect-error This is needed because preact sets the ref on the child object not on its props
        child.ref(el);
        // @ts-expect-error This is needed because preact sets the ref on the child object not on its props
      } else if (Type.isNonNullable(child.ref)) {
        // @ts-expect-error This is needed because preact sets the ref on the child object not on its props
        child.ref.current = el;
      }
      if (Type.isFunction(ref)) {
        ref(el);
      } else if (Type.isNonNullable(ref)) {
        ref.current = el;
      }
    },
    ...triggerEvents.includes('click') && onClickTriggerProps,
    ...triggerEvents.includes('hover') && onHoverTriggerProps,
    ...triggerEvents.includes('arrows') && onArrowTriggerProps
  });
});

const Trigger: React.ForwardRefExoticComponent<
  PropsWithChildren & React.RefAttributes<HTMLElement>
> = TriggerImpl;

export interface DropdownProps extends PropsWithChildren {
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap?: number;
  readonly triggerEvents?: Array<'click' | 'hover' | 'arrows'>;
}

const Root: FC<DropdownProps> = ({ children, side = 'top', align = 'start', gap = 8, triggerEvents = [ 'click' ] }) => {
  const triggerRef = useRef<HTMLElement | undefined>();
  const contentRef = useRef<HTMLDivElement | undefined>();
  const [ isOpen, setIsOpen ] = useState(false);

  // debounced hide popover function on mouse leave (used when trigger events include hover)
  const debouncedHideHoverablePopover = useMemo(() => Throttler.last((e: MouseEvent) => {
    // in the hover mode, the dropdown should close when the cursor is moved outside of the dropdown content, works for nested dropdowns
    if (!(e.relatedTarget instanceof Node) || !isInDropdownContent(contentRef, e.relatedTarget)) {
      contentRef.current?.hidePopover();
    }
  }, 300), []);

  const contextValue = useMemo(() => {
    return { triggerRef, contentRef, side, align, gap, triggerEvents, debouncedHideHoverablePopover, isOpen, setIsOpen };
  }, [ triggerRef, contentRef, side, align, gap, triggerEvents, debouncedHideHoverablePopover, isOpen ]);

  return <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>;
};

export {
  Root,
  Content,
  Trigger
};
