import { Throttler, Type, Obj } from '@ephox/katamari';
import { Children, cloneElement, forwardRef, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FC, type HTMLAttributes, type MouseEvent, type PropsWithChildren, type ReactElement, type KeyboardEvent } from 'react';

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

  const [ positioningStyles, setPositioningStyles ] = useState<CSSProperties>({ opacity: '0' });

  const updateToggleState = useCallback((event: ToggleEvent) => {
    setIsOpen(event.newState === 'open');
  }, [ setIsOpen ]);

  // this can be later replaced with CSS anchor positioning
  const updatePosition = useCallback(() => {
    // TODO: remove type casting after updating TypeScript. In the newest version addEventListener correctly produces ToggleEvent
    if (Type.isNonNullable(triggerRef.current) && Type.isNonNullable(contentRef.current)) {
      const documentRect = document.documentElement.getBoundingClientRect();
      const anchorRect = triggerRef.current.getBoundingClientRect();
      const anchoredContainerRect = contentRef.current.getBoundingClientRect();

      // using document rect as a boundry, but maybe it should be the Editor area?
      const newPositioningStyles = {
        opacity: '1',
        ...PositioningUtils.getPositionStyles({ anchorRect, anchoredContainerRect, side, align, gap, boundaryRect: documentRect })
      };

      setPositioningStyles((currentPositioningStyles) => {
        // avoid react rerendering when the styles are the same as before
        // casting to emty object to satisfy typescript
        if ( !Obj.equal(newPositioningStyles, currentPositioningStyles as {})) {
          return newPositioningStyles;
        } else {
          return currentPositioningStyles;
        }
      });
    }
  }, [ contentRef, triggerRef, align, side, gap ]);

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

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      // reset styles on close
      setPositioningStyles({ opacity: '0' });
    }
  }, [ isOpen, updatePosition, children ]);

  useEffect(() => {
    const onResize = () => {
      contentRef.current?.hidePopover();
    };
    const onOutsideScroll = (e: Event) => {
      if (!(e.target instanceof Node) || !isInDropdownContent(contentRef, e.target)) {
        contentRef.current?.hidePopover();
      }
    };
    window.addEventListener('scroll', onOutsideScroll, true);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onOutsideScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [ updatePosition, triggerRef, contentRef ]);

  const onHoverTriggerProps = {
    onMouseLeave: debouncedHideHoverablePopover.throttle,
    onMouseEnter: () => debouncedHideHoverablePopover.cancel()
  };

  const onArrowTriggerProps = {
    onKeyUp: (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        contentRef.current?.hidePopover();
      }
    }
  };

  const contentProps = {
    ...triggerEvents.includes('hover') && onHoverTriggerProps,
    ...triggerEvents.includes('arrows') && onArrowTriggerProps,
    ...props
  };
  return <div
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
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
    style={{ ...positioningStyles }}
    { ...contentProps }
  >
    {isOpen && children}
  </div>;
});

const Trigger: FC<PropsWithChildren> = ({ children }) => {
  const { triggerRef, contentRef, triggerEvents, debouncedHideHoverablePopover, isOpen } = useDropdown();

  let child = Children.toArray(children)[0];
  if (!isValidElement(child)) {
    return null;
  }
  child = child as ReactElement;

  const onHoverTriggerProps = {
    onMouseEnter: (e: MouseEvent) => {
      child.props.onMouseEnter?.(e);
      debouncedHideHoverablePopover.cancel();
      contentRef.current?.showPopover();
    },
    onMouseLeave: (e: MouseEvent) => {
      child.props.onMouseLeave?.(e);
      debouncedHideHoverablePopover.throttle(e);
    }
  };

  const onClickTriggerProps = {
    onClick: (e: MouseEvent) => {
      child.props.onClick?.(e);
      if (isOpen) {
        contentRef.current?.hidePopover();
      } else {
        contentRef.current?.showPopover();
      }
    }
  };

  const onArrowTriggerProps = {
    onKeyUp: (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        contentRef.current?.showPopover();
      }
    }
  };

  return cloneElement(child, {
    ref: (el: HTMLElement) => {
      triggerRef.current = el;
      if (Type.isFunction(child.props.ref )) {
        child.props.ref(el);
      } else if (Type.isNonNullable(child.props.ref)) {
        child.props.ref.current = el;
      }
    },
    ...triggerEvents.includes('click') && onClickTriggerProps,
    ...triggerEvents.includes('hover') && onHoverTriggerProps,
    ...triggerEvents.includes('arrows') && onArrowTriggerProps
  });
};

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
