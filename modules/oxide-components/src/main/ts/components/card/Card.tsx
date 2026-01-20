import { Type } from '@ephox/katamari';
import { useCallback, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';

import { useCardListContext } from './CardListContext';
import type { CardHighlightType, CardLayout } from './CardTypes';

export interface CardRootProps extends PropsWithChildren {
  readonly className?: string;
  readonly onSelect?: () => void;
  readonly selected?: boolean;
  readonly ariaLabel?: string;
  readonly hasDecision?: boolean;
  /**
   * Index of this card within a CardList.
   * Required when used inside CardList for proper keyboard navigation.
   */
  readonly index?: number;
}

export interface CardHeaderProps extends PropsWithChildren {
  readonly title?: string;
}

/**
 * Card Body component props.
 * Contains the main content of the card.
 */
export interface CardBodyProps extends PropsWithChildren {}

export interface CardActionsProps extends PropsWithChildren {
  readonly layout?: CardLayout;
}

export interface CardHighlightProps extends PropsWithChildren {
  readonly type: CardHighlightType;
}

/**
 * Card Root component.
 * Container for a card with support for selection states.
 * Must be used within a CardList for proper keyboard navigation.
 */
const Root: FC<CardRootProps> = ({
  children,
  className,
  onSelect,
  selected = false,
  ariaLabel,
  hasDecision = false,
  index
}) => {
  const listContext = useCardListContext();

  const isFocused = listContext?.focusedIndex === index;
  const isSelected = listContext?.selectedIndex === index;

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (target !== currentTarget) {
      const isInteractive = target.matches('button, a, input, textarea, select') ||
        target.closest('button, a, input, textarea, select');
      if (isInteractive) {
        return;
      }
    }

    if (listContext && index !== undefined) {
      listContext.onSelectCard?.(index);
      listContext.setFocusedIndex(index);
    }
    onSelect?.();
  }, [ onSelect, listContext, index ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Keyboard activation is handled by CardList's useFlowKeyNavigation
    // Only need to check for interactive child elements
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (target !== currentTarget) {
      const isInteractive = target.matches('button, a, input, textarea, select') ||
        target.closest('button, a, input, textarea, select');
      if (isInteractive) {
        return;
      }
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (listContext && index !== undefined) {
      listContext.setFocusedIndex(index);
    }
  }, [ listContext, index ]);

  const cardClassName = Bem.block('tox-card', {
    'selected': isFocused || selected,
    'has-decision': hasDecision
  }) + (Type.isNonNullable(className) ? ` ${className}` : '');

  return (
    <div
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={-1}
      role="option"
      aria-label={ariaLabel ?? `Card ${(index ?? 0) + 1}`}
      aria-selected={isSelected}
    >
      {children}
    </div>
  );
};

/**
 * Card Header component.
 * Displays the header/title section of the card.
 */
const Header: FC<CardHeaderProps> = ({ children, title }) => {
  return (
    <div className={Bem.element('tox-card', 'header')}>
      {Type.isNonNullable(title) ? title : children}
    </div>
  );
};

/**
 * Card Body component.
 * Contains the main content of the card.
 */
const Body: FC<CardBodyProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-card', 'body')}>
      {children}
    </div>
  );
};

/**
 * Card Actions component.
 * Contains action buttons (Skip, Apply, Revert, etc.)
 * Default layout is flex-start (buttons on left with gap between them)
 */
const Actions: FC<CardActionsProps> = ({ children, layout = 'flex-start' }) => {
  return (
    <div className={Bem.element('tox-card', 'actions', {
      'space-between': layout === 'space-between',
      'flex-start': layout === 'flex-start'
    })}>
      {children}
    </div>
  );
};

/**
 * Card Highlight component.
 * Displays highlighted text with added/deleted/modified styling.
 */
const Highlight: FC<CardHighlightProps> = ({ children, type }) => {
  return (
    <div className={Bem.element('tox-card', 'highlight', {
      added: type === 'added',
      deleted: type === 'deleted',
      modified: type === 'modified'
    })}>
      {children}
    </div>
  );
};

export {
  Root,
  Header,
  Body,
  Actions,
  Highlight
};

export { CardList } from './CardList';
export type { CardLayout, CardHighlightType } from './CardTypes';
