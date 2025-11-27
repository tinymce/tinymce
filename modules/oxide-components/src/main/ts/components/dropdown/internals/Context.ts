import type { Throttler } from '@ephox/katamari';
import { createContext, useContext, type MouseEvent } from 'react';

export interface DropdownState {
  readonly popoverId: string;
  readonly triggerRef: React.RefObject<HTMLButtonElement>;
  readonly contentRef: React.RefObject<HTMLDivElement>;
  readonly side: 'top' | 'bottom' | 'left' | 'right';
  readonly align: 'start' | 'center' | 'end';
  // margin/gap between the trigger button and anchored container
  readonly gap: number;
  readonly triggersOnHover: boolean;
  readonly debouncedHideHoverablePopover: Throttler.Throttler<[e: MouseEvent]>;
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