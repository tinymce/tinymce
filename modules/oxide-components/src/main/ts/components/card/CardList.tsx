import { Optional } from '@ephox/katamari';
import { useCallback, useMemo, useRef, useState, type FC, type PropsWithChildren } from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

import { CardListContext, type CardListContextValue } from './CardListContext';

export interface CardListProps extends PropsWithChildren {
  /**
   * Optional CSS class name to apply to the list container.
   */
  readonly className?: string;
  /**
   * Index of the initially focused card (uncontrolled mode).
   * @default 0
   */
  readonly defaultFocusedIndex?: number;
  /**
   * Index of the initially selected card (uncontrolled mode).
   */
  readonly defaultSelectedIndex?: number;
  /**
   * Index of the currently focused card (controlled mode).
   * When provided, the component becomes controlled for focus.
   */
  readonly focusedIndex?: number;
  /**
   * Index of the currently selected card (controlled mode).
   * When provided, the component becomes controlled for selection.
   */
  readonly selectedIndex?: number;
  /**
   * Callback fired when the focused index changes (controlled mode).
   */
  readonly onFocusedIndexChange?: (index: number) => void;
  /**
   * Callback fired when a card is selected.
   */
  readonly onSelectCard?: (index: number) => void;
  /**
   * Accessible label for the card list.
   */
  readonly ariaLabel?: string;
  /**
   * Whether to allow cycling through cards with arrow keys.
   * @default false
   */
  readonly cycles?: boolean;
}

/**
 * CardList component for managing a collection of cards with keyboard navigation.
 *
 * Provides arrow key navigation between cards. Focus is managed programmatically.
 * Follows WCAG accessibility guidelines for listbox pattern.
 *
 * @example
 * ```tsx
 * <CardList ariaLabel="Review suggestions" onSelectCard={(index) => console.log(index)}>
 *   <Card.Root index={0}>...</Card.Root>
 *   <Card.Root index={1}>...</Card.Root>
 * </CardList>
 * ```
 */
export const CardList: FC<CardListProps> = ({
  children,
  className,
  defaultFocusedIndex = 0,
  defaultSelectedIndex,
  focusedIndex: controlledFocusedIndex,
  selectedIndex: controlledSelectedIndex,
  onFocusedIndexChange,
  onSelectCard,
  ariaLabel,
  cycles = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ uncontrolledFocusedIndex, setUncontrolledFocusedIndex ] = useState(defaultFocusedIndex);
  const [ uncontrolledSelectedIndex, setUncontrolledSelectedIndex ] = useState(defaultSelectedIndex);

  const isFocusControlled = controlledFocusedIndex !== undefined;
  const isSelectionControlled = controlledSelectedIndex !== undefined;

  const focusedIndex = isFocusControlled ? controlledFocusedIndex : uncontrolledFocusedIndex;
  const selectedIndex = isSelectionControlled ? controlledSelectedIndex : uncontrolledSelectedIndex;

  const setFocusedIndex = useCallback((index: number) => {
    if (isFocusControlled) {
      onFocusedIndexChange?.(index);
    } else {
      setUncontrolledFocusedIndex(index);
    }
  }, [ isFocusControlled, onFocusedIndexChange ]);

  const handleSelectCard = useCallback((index: number) => {
    if (onSelectCard) {
      onSelectCard(index);
    }
    if (!isSelectionControlled) {
      setUncontrolledSelectedIndex(index);
    }
  }, [ onSelectCard, isSelectionControlled ]);

  const contextValue = useMemo<CardListContextValue>(() => ({
    focusedIndex,
    selectedIndex,
    setFocusedIndex,
    onSelectCard: handleSelectCard
  }), [ focusedIndex, selectedIndex, setFocusedIndex, handleSelectCard ]);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef,
    selector: '.tox-card',
    allowVertical: true,
    allowHorizontal: false,
    cycles,
    closest: false,
    execute: (focused) => {
      focused.dom.click();
      return Optional.some(true);
    }
  });

  const listClassName = Bem.block('tox-card-list') + (className ? ` ${className}` : '');

  return (
    <CardListContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        role="listbox"
        aria-label={ariaLabel ?? 'Card list'}
        className={listClassName}
      >
        {children}
      </div>
    </CardListContext.Provider>
  );
};
