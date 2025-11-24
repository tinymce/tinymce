import { useCallback, useEffect, useId, useRef, useState, type FC, type PropsWithChildren } from 'react';

import { Bem } from '../../main';
import { Button, type ButtonProps } from '../button/Button';

import { DropdownContext, useDropdown } from './internals/Context';
import * as PositioningUtils from './internals/PositioningUtils';

export interface DropdownProps extends PropsWithChildren {
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
}

// margin/gap between the trigger button and anchored container
const GAP = 8;

const Content: FC<PropsWithChildren> = ({ children, ...props }) => {
  const { popoverId, triggerRef, side, align } = useDropdown();
  const contentRef = useRef<HTMLDivElement>(null);

  const [ positioningStyles, setPositioningStyles ] = useState({});

  // this can be later replaced with CSS anchor positioning
  const updatePosition = useCallback((event: Event) => {
    // TODO: remove type casting after updating TypeScript. In the newest version addEventListener correctly produces ToggleEvent
    if ((event as ToggleEvent).newState === 'open' && triggerRef.current && contentRef.current) {
      const documentRect = document.documentElement.getBoundingClientRect();
      const anchorRect = triggerRef.current.getBoundingClientRect();
      const anchoredContainerRect = contentRef.current.getBoundingClientRect();

      // using document rect as a boundry, but maybe it should be the Editor area?
      setPositioningStyles(PositioningUtils.getPositionStyles({ anchorRect, anchoredContainerRect, side, align, gap: GAP, boundaryRect: documentRect }));
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
  return <div className={Bem.block('tox-dropdown-content')} popover='auto' id={popoverId} ref={contentRef} { ...props } style={{ ...positioningStyles }}>
    {children}
  </div>;
};

const TriggerButton: FC<ButtonProps> = ({ children, ...args }) => {
  const { popoverId, triggerRef } = useDropdown();

  // @ts-expect-error - TODO: Remove this expect error once we've upgraded to React 19+
  return <Button popovertarget={popoverId} popovertargetaction={'toggle'} ref={triggerRef} {...args}>{children}</Button>;
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
