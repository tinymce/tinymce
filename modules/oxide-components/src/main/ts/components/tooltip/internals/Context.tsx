import { createContext, useContext } from 'react';

export interface TooltipContext {
  readonly elementId: string;
  readonly canShow: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setCanShow: (canShow: boolean) => void;
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

interface GlobalTooltipContextData {
  readonly currentTooltipId: string | null;
  readonly setCurrentTooltipId: (id: string | null) => void;
};

export const GlobalTooltipContext = createContext<GlobalTooltipContextData | null>(null);

export const useGlobalTooltip = (): GlobalTooltipContextData => {
  const context = useContext(GlobalTooltipContext);
  if (context === null) {
    throw new Error('Tooltip compound components must be rendered within the Tooltip component');
  }
  return context;
};
