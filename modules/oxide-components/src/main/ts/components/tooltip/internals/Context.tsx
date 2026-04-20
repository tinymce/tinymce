import { createContext, useContext } from 'react';

export interface TooltipContext {
  readonly isOpen: boolean;
  readonly shouldRenderComponents: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly setRenderComponents: (isOpen: boolean) => void;
  readonly contentRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly triggerRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly showCondition: 'always' | 'overflow';
  readonly popupAnchor: string;
}

export const TooltipContext = createContext<TooltipContext | null>(null);

export const useTooltip = (): TooltipContext => {
  const context = useContext(TooltipContext);
  if (context === null) {
    throw new Error('Tooltip compound components must be rendered within the Tooltip component');
  }
  return context;
};
