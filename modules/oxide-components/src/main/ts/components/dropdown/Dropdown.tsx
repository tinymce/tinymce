import { Throttler, Type } from '@ephox/katamari';
import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FC, type HTMLAttributes, type MouseEvent, type PropsWithChildren, type ReactElement } from 'react';

import { Bem } from '../../main';

import { DropdownContext, useDropdown } from './internals/Context';
import * as PositioningUtils from './internals/PositioningUtils';

const isInDropdownContent = (contentRef: React.RefObject<HTMLDivElement>, node: Node): boolean => {
  return contentRef.current?.contains(node) ?? false;
};

const Content: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => {
  const { triggerRef, side, align, gap, contentRef, triggerEvent, debouncedHideHoverablePopover, isOpen, setIsOpen } = useDropdown();

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
      setPositioningStyles({
        opacity: '1',
        ...PositioningUtils.getPositionStyles({ anchorRect, anchoredContainerRect, side, align, gap, boundaryRect: documentRect })
      });
    }
  }, [ contentRef, triggerRef, align, side, gap ]);

  useEffect(() => {
    const element = contentRef.current;
    if (element === null) {
      return;
    }
    const onToggle = (e: Event) => {
      updateToggleState(e as ToggleEvent);
      if ((e as ToggleEvent).newState === 'closed') {
        triggerRef.current?.focus();
      }
    };

    element.addEventListener('toggle', onToggle);

    return () => {
      element.removeEventListener('toggle', onToggle);
    };
  }, [ contentRef, triggerRef, updatePosition, updateToggleState ]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      // reset styles on close
      setPositioningStyles({ opacity: '0' });
    }
  }, [ isOpen, updatePosition ]);

  return <div
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
    popover='auto'
    className={Bem.block('tox-dropdown-content')}
    ref={contentRef}
    style={{ ...positioningStyles }}
    { ...(triggerEvent === 'hover' || triggerEvent === 'both') && {
      onMouseLeave: debouncedHideHoverablePopover.throttle,
      onMouseEnter: () => debouncedHideHoverablePopover.cancel()
    }}
    { ...props }
  >
    {isOpen && children}
  </div>;
};

const Trigger: FC<PropsWithChildren> = ({ children }) => {
  const { triggerRef, contentRef, triggerEvent, debouncedHideHoverablePopover, isOpen } = useDropdown();

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

  return cloneElement(child, {
    ref: (el: HTMLDivElement) => {
      triggerRef.current = el;
      if (Type.isFunction(child.props.ref )) {
        child.props.ref(el);
      } else if (Type.isNonNullable(child.props.ref)) {
        child.props.ref.current = el;
      }
    },
    ...triggerEvent === 'click' && onClickTriggerProps,
    ...triggerEvent === 'hover' && onHoverTriggerProps,
    ...triggerEvent === 'both' && { ...onClickTriggerProps, ...onHoverTriggerProps },
  });
};

export interface DropdownProps extends PropsWithChildren {
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap?: number;
  readonly triggerEvent?: 'click' | 'hover' | 'both';
}

const Root: FC<DropdownProps> = ({ children, side = 'top', align = 'start', gap = 8, triggerEvent = 'click' }) => {
  const triggerRef = useRef<HTMLElement | undefined>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [ isOpen, setIsOpen ] = useState(false);

  // debounced hide popover function on mouse leave (used when triggersOnHover is enabled)
  const debouncedHideHoverablePopover = useMemo(() => Throttler.last((e: MouseEvent) => {
    // in the hover mode, the dropdown should close when the cursor is moved outside of the dropdown content, works for nested dropdowns
    if (!(e.relatedTarget instanceof Node) || !isInDropdownContent(contentRef, e.relatedTarget)) {
      contentRef.current?.hidePopover();
    }
  }, 300), []);

  const contextValue = useMemo(() => {
    return { triggerRef, contentRef, side, align, gap, triggerEvent, debouncedHideHoverablePopover, isOpen, setIsOpen };
  }, [ triggerRef, contentRef, side, align, gap, triggerEvent, debouncedHideHoverablePopover, isOpen ]);

  return <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>;
};

export {
  Root,
  Content,
  Trigger
};
