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

interface CardListImplProps {
  readonly children: PropsWithChildren['children'];
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly cycles: boolean;
  readonly focusedIndex: number;
  readonly selectedIndex: number | undefined;
  readonly setFocusedIndex: (index: number) => void;
  readonly onSelectCard: ((index: number) => void) | undefined;
}

const CardListImpl: FC<CardListImplProps> = ({
  children,
  className,
  ariaLabel,
  cycles,
  focusedIndex,
  selectedIndex,
  setFocusedIndex,
  onSelectCard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo<CardListContextValue>(() => ({
    focusedIndex,
    selectedIndex,
    setFocusedIndex,
    onSelectCard
  }), [ focusedIndex, selectedIndex, setFocusedIndex, onSelectCard ]);

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

const CardListControlled: FC<CardListProps> = ({
  children,
  className,
  ariaLabel,
  cycles = false
}) => {
  const controllerContext = useCardListControllerContext();

  if (controllerContext === null) {
    throw new Error('CardList: Controlled mode requires CardListController wrapper');
  }

  const setFocusedIndex = useCallback((index: number) => {
    controllerContext.onFocusedIndexChange(index);
  }, [ controllerContext ]);

  const handleSelectCard = useCallback((index: number) => {
    controllerContext.onSelectCard?.(index);
  }, [ controllerContext ]);

  return (
    <CardListImpl
      children={children}
      className={className}
      ariaLabel={ariaLabel}
      cycles={cycles}
      focusedIndex={controllerContext.focusedIndex}
      selectedIndex={controllerContext.selectedIndex}
      setFocusedIndex={setFocusedIndex}
      onSelectCard={handleSelectCard}
    />
  );
};

const CardListUncontrolled: FC<CardListProps> = ({
  children,
  className,
  ariaLabel,
  cycles = false,
  defaultFocusedIndex = 0,
  defaultSelectedIndex,
  onSelectCard
}) => {
  const [ focusedIndex, setFocusedIndex ] = useState(defaultFocusedIndex);
  const [ selectedIndex, setSelectedIndex ] = useState(defaultSelectedIndex);

  const handleSelectCard = useCallback((index: number) => {
    onSelectCard?.(index);
    setSelectedIndex(index);
  }, [ onSelectCard ]);

  return (
    <CardListImpl
      children={children}
      className={className}
      ariaLabel={ariaLabel}
      cycles={cycles}
      focusedIndex={focusedIndex}
      selectedIndex={selectedIndex}
      setFocusedIndex={setFocusedIndex}
      onSelectCard={handleSelectCard}
    />
  );
};

export const CardList: FC<CardListProps> = (props) => {
  const controllerContext = useCardListControllerContext();

  return controllerContext !== null
    ? <CardListControlled {...props} />
    : <CardListUncontrolled {...props} />;
};
