import { Global } from '@ephox/katamari';
import { createContext, useContext } from 'react';

export interface TooltipContext {
  readonly isOpen: boolean;
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

// Some plugins bundle their own independent copy of oxide-components (core plugin bundle vs. lazily-loaded sidebar bundle),
// so a bare module-level singleton would not be shared between them.
// Keying off `window` ensures every bundle copy resolves to the same
// EventTarget so CloseActiveTooltips coordination works across bundle boundaries.
const TOOLTIPS_EVENT_TARGET_KEY = '__tinymceOxideTooltipsEventTarget__';

const getTooltipsEventTarget = (): EventTarget => {
  if (!Global[TOOLTIPS_EVENT_TARGET_KEY]) {
    Global[TOOLTIPS_EVENT_TARGET_KEY] = new window.EventTarget();
  }
  return Global[TOOLTIPS_EVENT_TARGET_KEY];
};
export const tooltipsEventTarget = getTooltipsEventTarget();
