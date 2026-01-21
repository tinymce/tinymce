import { Optional, Type } from '@ephox/katamari';
import { useCallback, useMemo, useRef, useState, type FC, type PropsWithChildren } from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

import {
  CardListContext,
  CardListControllerContext,
  useCardListControllerContext,
  type CardListContextValue,
  type CardListControllerContextValue
} from './CardListContext';

/**
 * Props for CardListController - the controlled state provider.
 */
export interface CardListControllerProps extends PropsWithChildren {
  /**
   * Index of the currently focused card (required).
   */
  readonly focusedIndex: number;
  /**
   * Callback fired when the focused index should change (required).
   */
  readonly onFocusedIndexChange: (index: number) => void;
  /**
   * Index of the currently selected card.
   */
  readonly selectedIndex?: number;
  /**
   * Callback fired when a card is selected.
   */
  readonly onSelectCard?: (index: number) => void;
}

/**
 * Props for CardList component.
 */
export interface CardListProps extends PropsWithChildren {
  /**
   * Optional CSS class name to apply to the list container.
   */
  readonly className?: string;
  /**
   * Accessible label for the card list.
   */
  readonly ariaLabel?: string;
  /**
   * Whether to allow cycling through cards with arrow keys.
   * @default false
   */
  readonly cycles?: boolean;
  /**
   * Index of the initially focused card (uncontrolled mode only).
   * Ignored when used inside CardListController.
   * @default 0
   */
  readonly defaultFocusedIndex?: number;
  /**
   * Index of the initially selected card (uncontrolled mode only).
   * Ignored when used inside CardListController.
   */
  readonly defaultSelectedIndex?: number;
  /**
   * Callback fired when a card is selected (uncontrolled mode only).
   * Ignored when used inside CardListController.
   */
  readonly onSelectCard?: (index: number) => void;
}

/**
 * CardListController provides controlled state for CardList via context.
 *
 * Wrap CardList with this component when you need to control the focus
 * and selection state externally.
 *
 * @example
 * ```tsx
 * const [focusedIndex, setFocusedIndex] = useState(0);
 * const [selectedIndex, setSelectedIndex] = useState<number>();
 *
 * <CardListController
 *   focusedIndex={focusedIndex}
 *   onFocusedIndexChange={setFocusedIndex}
 *   selectedIndex={selectedIndex}
 *   onSelectCard={setSelectedIndex}
 * >
 *   <CardList ariaLabel="Review suggestions">
 *     <Card.Root index={0}>...</Card.Root>
 *     <Card.Root index={1}>...</Card.Root>
 *   </CardList>
 * </CardListController>
 * ```
 */
export const CardListController: FC<CardListControllerProps> = ({
  children,
  focusedIndex,
  onFocusedIndexChange,
  selectedIndex,
  onSelectCard
}) => {
  const controllerValue = useMemo<CardListControllerContextValue>(() => ({
    focusedIndex,
    selectedIndex,
    onFocusedIndexChange,
    onSelectCard
  }), [ focusedIndex, selectedIndex, onFocusedIndexChange, onSelectCard ]);

  return (
    <CardListControllerContext.Provider value={controllerValue}>
      {children}
    </CardListControllerContext.Provider>
  );
};

/**
 * CardList component for managing a collection of cards with keyboard navigation.
 *
 * Can be used in two modes:
 * - **Uncontrolled**: Use directly with `defaultFocusedIndex` and `defaultSelectedIndex`
 * - **Controlled**: Wrap with `CardListController` to manage state externally
 *
 * Provides arrow key navigation between cards. Focus is managed programmatically.
 * Follows WCAG accessibility guidelines for listbox pattern.
 *
 * @example Uncontrolled usage
 * ```tsx
 * <CardList ariaLabel="Review suggestions" defaultFocusedIndex={0}>
 *   <Card.Root index={0}>...</Card.Root>
 *   <Card.Root index={1}>...</Card.Root>
 * </CardList>
 * ```
 *
 * @example Controlled usage
 * ```tsx
 * <CardListController focusedIndex={idx} onFocusedIndexChange={setIdx}>
 *   <CardList ariaLabel="Review suggestions">
 *     <Card.Root index={0}>...</Card.Root>
 *     <Card.Root index={1}>...</Card.Root>
 *   </CardList>
 * </CardListController>
 * ```
 */
export const CardList: FC<CardListProps> = ({
  children,
  className,
  ariaLabel,
  cycles = false,
  defaultFocusedIndex = 0,
  defaultSelectedIndex,
  onSelectCard: uncontrolledOnSelectCard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerContext = useCardListControllerContext();
  const isControlled = controllerContext !== null;

  // Uncontrolled state (only used when not inside CardListController)
  const [ uncontrolledFocusedIndex, setUncontrolledFocusedIndex ] = useState(defaultFocusedIndex);
  const [ uncontrolledSelectedIndex, setUncontrolledSelectedIndex ] = useState(defaultSelectedIndex);

  // Resolve actual values based on controlled vs uncontrolled mode
  const focusedIndex = isControlled ? controllerContext.focusedIndex : uncontrolledFocusedIndex;
  const selectedIndex = isControlled ? controllerContext.selectedIndex : uncontrolledSelectedIndex;

  const setFocusedIndex = useCallback((index: number) => {
    if (isControlled) {
      controllerContext.onFocusedIndexChange(index);
    } else {
      setUncontrolledFocusedIndex(index);
    }
  }, [ isControlled, controllerContext ]);

  const handleSelectCard = useCallback((index: number) => {
    if (isControlled) {
      controllerContext.onSelectCard?.(index);
    } else {
      uncontrolledOnSelectCard?.(index);
      setUncontrolledSelectedIndex(index);
    }
  }, [ isControlled, controllerContext, uncontrolledOnSelectCard ]);

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

  const listClassName = Bem.block('tox-card-list') + (Type.isNonNullable(className) ? ` ${className}` : '');

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
