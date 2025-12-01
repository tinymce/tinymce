import { Throttler } from '@ephox/katamari';
import { useCallback, useEffect, useMemo, useRef, useState, type FC, type HTMLAttributes, type MouseEvent, type PropsWithChildren } from 'react';

import { Bem } from '../../main';

import { DropdownContext, useDropdown } from './internals/Context';
import * as PositioningUtils from './internals/PositioningUtils';

const isInDropdownContent = (contentRef: React.RefObject<HTMLDivElement>, node: Node): boolean => {
  return contentRef.current?.contains(node) ?? false;
};

// TODO: invastigate lazy loading content children (look at the FloatingSidebar component). Could be tricky - to correctly calculate the position we need children to be rendered
const Content: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => {
  const { triggerRef, side, align, gap, contentRef, triggerEvent, debouncedHideHoverablePopover, setIsOpen } = useDropdown();

  const [ positioningStyles, setPositioningStyles ] = useState({});

  const updateToggleState = useCallback((event: ToggleEvent) => {
    setIsOpen(event.newState === 'open');
  }, [ setIsOpen ]);

  // this can be later replaced with CSS anchor positioning
  const updatePosition = useCallback((event: ToggleEvent) => {
    // TODO: remove type casting after updating TypeScript. In the newest version addEventListener correctly produces ToggleEvent
    if (event.newState === 'open' && triggerRef.current && contentRef.current) {
      const documentRect = document.documentElement.getBoundingClientRect();
      const anchorRect = triggerRef.current.getBoundingClientRect();
      const anchoredContainerRect = contentRef.current.getBoundingClientRect();

      // using document rect as a boundry, but maybe it should be the Editor area?
      setPositioningStyles(PositioningUtils.getPositionStyles({ anchorRect, anchoredContainerRect, side, align, gap, boundaryRect: documentRect }));
    }
  }, [ contentRef, triggerRef, align, side, gap ]);

  useEffect(() => {
    const element = contentRef.current;
    if (element === null) {
      return;
    }
    const onToggle = (e: Event) => {
      updateToggleState(e as ToggleEvent);
      updatePosition(e as ToggleEvent);
    };

    element.addEventListener('toggle', onToggle);

    return () => {
      element.removeEventListener('toggle', onToggle);
    };
  }, [ contentRef, updatePosition, updateToggleState ]);

  return <div
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
    popover='auto'
    className={Bem.block('tox-dropdown-content')}
    ref={contentRef}
    style={{ ...positioningStyles }}
    { ...triggerEvent === 'hover' && {
      onMouseLeave: debouncedHideHoverablePopover.throttle,
      onMouseEnter: () => debouncedHideHoverablePopover.cancel()
    }}
    { ...props }
  >
    {children}
  </div>;
};

const Trigger: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...args }) => {
  const { triggerRef, contentRef, triggerEvent, debouncedHideHoverablePopover, isOpen } = useDropdown();

  const onHoverTriggerProps = {
    onMouseEnter: () => {
      contentRef.current?.showPopover();
      debouncedHideHoverablePopover.cancel();
    },
    onMouseLeave: (e: MouseEvent) => {
      debouncedHideHoverablePopover.throttle(e);
    }
  };

  const onClickTriggerProps = {
    onClick: () => {
      if (isOpen) {
        contentRef.current?.hidePopover();
      } else {
        contentRef.current?.showPopover();
      }
    }
  };

  const props = {
    children,
    ref: triggerRef,
    ...triggerEvent === 'click' && onClickTriggerProps,
    ...triggerEvent === 'hover' && onHoverTriggerProps,
    ...triggerEvent === 'both' && { ...onClickTriggerProps, ...onHoverTriggerProps },
    ...args
  };

  return <div { ...props }/>;
};

export interface DropdownProps extends PropsWithChildren {
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap?: number;
  readonly triggerEvent?: 'click' | 'hover' | 'both';
}

const Root: FC<DropdownProps> = ({ children, side = 'top', align = 'start', gap = 8, triggerEvent = 'click' }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
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
