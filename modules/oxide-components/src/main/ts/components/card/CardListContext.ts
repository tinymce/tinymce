import { createContext, useContext } from 'react';

export interface CardListContextValue {
  /** Index of the currently focused card for roving tabindex */
  readonly focusedIndex: number;
  /** Index of the currently selected card */
  readonly selectedIndex?: number;
  /** Callback to update focused card index */
  readonly setFocusedIndex: (index: number) => void;
  /** Callback to select a card */
  readonly onSelectCard?: (index: number) => void;
}

export const CardListContext = createContext<CardListContextValue | null>(null);

export const useCardListContext = (): CardListContextValue | null => {
  return useContext(CardListContext);
};
