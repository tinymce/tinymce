import type { Throttler } from '@ephox/katamari';
import { createContext, useContext, type MouseEvent } from 'react';

export interface DropdownState {
  readonly triggerRef: React.MutableRefObject<HTMLElement | undefined>;
  readonly contentRef: React.MutableRefObject<HTMLDivElement | undefined>;
  readonly side: 'top' | 'bottom' | 'left' | 'right';
  readonly align: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap: number;
  readonly triggerEvents: Array<'click' | 'hover' | 'arrows'>;
  readonly debouncedHideHoverablePopover: Throttler.Throttler<[e: MouseEvent]>;
  readonly isOpen: boolean;
  readonly setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = createContext<DropdownState | null>(null);

const useDropdown = (): DropdownState => {
  const context = useContext(DropdownContext);
  if (context === null) {
    throw new Error('Dropdown compound components must be rendered within the Dropdown component');
  }
  return context;
};

export { useDropdown, DropdownContext };