import { createContext, useContext } from 'react';

/**
 * Context value for Card components to read list state.
 */
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

/**
 * Context value provided by CardListController for controlled mode.
 */
export interface CardListControllerContextValue {
  /** Index of the currently focused card (controlled) */
  readonly focusedIndex: number;
  /** Index of the currently selected card (controlled) */
  readonly selectedIndex?: number;
  /** Callback fired when focused index should change */
  readonly onFocusedIndexChange: (index: number) => void;
  /** Callback fired when a card is selected */
  readonly onSelectCard?: (index: number) => void;
}

/**
 * Context for Card components to read list state.
 */
export const CardListContext = createContext<CardListContextValue | null>(null);

/**
 * Context provided by CardListController for controlled mode.
 * CardList checks this to determine if it should use controlled state.
 */
export const CardListControllerContext = createContext<CardListControllerContextValue | null>(null);

/**
 * Hook for Card components to access list context.
 */
export const useCardListContext = (): CardListContextValue | null => {
  return useContext(CardListContext);
};

/**
 * Hook to check if CardList is inside a CardListController.
 * Returns the controller context if present, null otherwise.
 */
export const useCardListControllerContext = (): CardListControllerContextValue | null => {
  return useContext(CardListControllerContext);
};
