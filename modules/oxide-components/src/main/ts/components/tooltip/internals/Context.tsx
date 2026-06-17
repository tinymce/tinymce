import { createContext, useContext } from 'react';

export interface TooltipTriggerRef {
  readonly get: () => string | null;
  readonly set: (value: string | null) => void;
  readonly subscribe: (callback: () => void) => () => void;
}

export const createTooltipTrigger = (): TooltipTriggerRef => {
  let value: string | null = null;
  const subscribers = new Set<() => void>();
  return {
    get: () => value,
    set: (newValue) => {
      value = newValue;
      subscribers.forEach((sub) => sub());
    },
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    }
  };
};

export interface TooltipContext {
  readonly isOpen: boolean;
  readonly elementId: string;
  readonly currentTooltipTrigger: TooltipTriggerRef | null;
  readonly canShow: boolean;
  readonly delayForShow: number;
  readonly delayForHide: number;
  readonly setIsOpen: (isOpen: boolean) => void;
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
