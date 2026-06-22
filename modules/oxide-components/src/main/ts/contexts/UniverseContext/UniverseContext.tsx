import { createContext } from 'react';

import type { TooltipTriggerRef, UniverseResources } from './UniverseTypes';

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

export const UniverseContext = createContext<UniverseResources | null>(null);
