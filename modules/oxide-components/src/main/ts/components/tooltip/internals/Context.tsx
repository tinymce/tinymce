import { createContext, useContext } from 'react';

export interface TooltipState {
  readonly isOpen: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly contentRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly triggerRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly popupAnchor: string;
}

export const TooltipContext = createContext<TooltipState | null>(null);

export const useTooltip = (): TooltipState => {
  const context = useContext(TooltipContext);
  if (context === null) {
    throw new Error('Tooltip compound components must be rendered within the Tooltip component');
  }
  return context;
};
