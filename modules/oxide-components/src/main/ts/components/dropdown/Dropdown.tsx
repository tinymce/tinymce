import { useCallback, useEffect, useId, useRef, useState, type FC, type PropsWithChildren } from 'react';

import { Button } from '../button/Button';

import { DropdownContext, useDropdown } from './internals/context';
import { getPositionStyles } from './internals/positioningUtils';

export interface DropdownProps extends PropsWithChildren {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

// margin/gap between the trigger button and anchored container
const GAP = 8;

const Content: FC<PropsWithChildren> = ({ children, ...props }) => {
  const { popoverId, triggerRef, side, align } = useDropdown();
  const contentRef = useRef<HTMLDivElement>(null);

  const [ positioningStyles, setPositioningStyles ] = useState({});

  // this can be later replaced with CSS anchor positioning
  const updatePosition = useCallback((event: Event) => {
    if ((event as ToggleEvent).newState === 'open' && triggerRef.current && contentRef.current) {
      const documentRect = document.documentElement.getBoundingClientRect();
      const anchorRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      // using document rect as a boundry, but maybe it should be the Editor area?
      setPositioningStyles(getPositionStyles(anchorRect, contentRect, side, align, GAP, documentRect));
    }
  }, [ contentRef, triggerRef, align, side ]);

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

  // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
  return <div popover='auto' id={popoverId} ref={contentRef} { ...props } style={{
    position: 'fixed',
    overflow: 'auto',
    display: '',
    height: 'fit-content',
    width: 'fit-content',
    ...positioningStyles
  }}>
    {children}
  </div>;
};

const TriggerButton: FC<PropsWithChildren> = ({ children }) => {
  const { popoverId, triggerRef } = useDropdown();

  // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
  return <Button variant='secondary' popovertarget={popoverId} popovertargetaction={'toggle'} ref={triggerRef} >{children}</Button>;
};

const Root: FC<DropdownProps> = ({ children, side = 'top', align = 'start' }) => {
  const popoverId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return <DropdownContext.Provider value={{ triggerRef, popoverId, side, align }}>{children}</DropdownContext.Provider>;
};

export {
  Root,
  Content,
  TriggerButton
};
