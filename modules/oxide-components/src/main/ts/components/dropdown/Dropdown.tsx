import { Throttler } from '@ephox/katamari';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FC, type MouseEvent, type PropsWithChildren } from 'react';

import { Bem } from '../../main';
import { Button, type ButtonProps } from '../button/Button';

import { DropdownContext, useDropdown } from './internals/Context';
import * as PositioningUtils from './internals/PositioningUtils';

const isInDropdownContent = (contentRef: React.RefObject<HTMLDivElement>, node: Node): boolean => {
  return contentRef.current?.contains(node) || false;
};

// TODO: invastigate lazy loading content children (look at the FloatingSidebar component). Could be tricky - to correctly calculate the position we need children to be rendered
const Content: FC<PropsWithChildren> = ({ children, ...props }) => {
  const { popoverId, triggerRef, side, align, gap, contentRef, triggersOnHover, debouncedHideHoverablePopover } = useDropdown();

  const [ positioningStyles, setPositioningStyles ] = useState({});

  // this can be later replaced with CSS anchor positioning
  const updatePosition = useCallback((event: Event) => {
    // TODO: remove type casting after updating TypeScript. In the newest version addEventListener correctly produces ToggleEvent
    if ((event as ToggleEvent).newState === 'open' && triggerRef.current && contentRef.current) {
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
    element.addEventListener('toggle', updatePosition);

    return () => {
      element.removeEventListener('toggle', updatePosition);
    };
  }, [ contentRef, updatePosition ]);

  return <div
    // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
    popover='auto'
    className={Bem.block('tox-dropdown-content')}
    id={popoverId}
    ref={contentRef}
    style={{ ...positioningStyles }}
    { ...triggersOnHover && {
      onMouseLeave: debouncedHideHoverablePopover.throttle,
      onMouseEnter: () => debouncedHideHoverablePopover.cancel()
    }}
    { ...props }
  >
    {children}
  </div>;
};

const TriggerButton: FC<ButtonProps> = ({ children, ...args }) => {
  const { popoverId, triggerRef, contentRef, triggersOnHover, debouncedHideHoverablePopover } = useDropdown();

  const onHoverTriggerProps = {
    onMouseEnter: () => {
      contentRef.current?.showPopover();
      debouncedHideHoverablePopover.cancel();
    },
    onMouseLeave: (e: MouseEvent) => {
      debouncedHideHoverablePopover.throttle(e);
    }
  };

  const props = {
    popovertarget: popoverId,
    popovertargetaction: 'toggle',
    ref: triggerRef,
    children,
    ...triggersOnHover && onHoverTriggerProps,
    ...args
  };

  return (<>{ args.variant ? <Button { ...props } variant={args.variant} /> : <button { ...props }/> }</>);
};

export interface DropdownProps extends PropsWithChildren {
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap?: number;
  readonly triggersOnHover?: boolean;
}

const Root: FC<DropdownProps> = ({ children, side = 'top', align = 'start', gap = 8, triggersOnHover = false }) => {
  const popoverId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // debounced hide popover function on mouse leave (used when triggersOnHover is enabled)
  const debouncedHideHoverablePopover = useMemo(() => Throttler.last((e: MouseEvent) => {
    // in the hover mode, the dropdown should close when the cursor is moved outside of the dropdown content, works for nested dropdowns
    if (!(e.relatedTarget instanceof Node) || !isInDropdownContent(contentRef, e.relatedTarget)) {
      contentRef.current?.hidePopover();
    }
  }, 300), []);

  return <DropdownContext.Provider value={{ triggerRef, contentRef, popoverId, side, align, gap, triggersOnHover, debouncedHideHoverablePopover }}>{children}</DropdownContext.Provider>;
};

export {
  Root,
  Content,
  TriggerButton
};
