import { Type } from '@ephox/katamari';
import { useCallback, useEffect, type FC, type PropsWithChildren } from 'react';

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
 * Can be used standalone or within a CardList for keyboard navigation.
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

  const isFocused = listContext
    ? listContext.focusedIndex === index
    : selected;

  useEffect(() => {
    if (listContext && index !== undefined && isFocused) {
      listContext.setFocusedIndex(index);
    }
  }, [ listContext, index, isFocused ]);

  const handleClick = useCallback(() => {
    if (listContext && index !== undefined) {
      listContext.onSelectCard?.(index);
      listContext.setFocusedIndex(index);
    }
    onSelect?.();
  }, [ onSelect, listContext, index ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('button, a, input, textarea, select, [role="button"]')) {
      return;
    }

    if (!listContext && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect?.();
    }
  }, [ onSelect, listContext ]);

  const handleFocus = useCallback(() => {
    if (listContext && index !== undefined) {
      listContext.setFocusedIndex(index);
    }
  }, [ listContext, index ]);

  const cardClassName = Bem.block('tox-card', {
    'selected': listContext ? isFocused : selected,
    'has-decision': hasDecision
  }) + (Type.isNonNullable(className) ? ` ${className}` : '');

  const role = listContext ? 'option' : 'button';
  const ariaAttribute = listContext
    ? { 'aria-selected': selected }
    : { 'aria-pressed': selected };

  return (
    <div
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={isFocused ? 0 : -1}
      role={role}
      aria-label={ariaLabel ?? 'Card'}
      {...ariaAttribute}
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
