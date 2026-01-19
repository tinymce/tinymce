import { Type } from '@ephox/katamari';
import { useCallback, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';

import type { CardHighlightType, CardLayout } from './CardTypes';

export interface CardRootProps extends PropsWithChildren {
  readonly className?: string;
  readonly onSelect?: () => void;
  readonly active?: boolean;
  readonly ariaLabel?: string;
  readonly hasDecision?: boolean;
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
 * Container for a card with support for active/resolution states.
 */
const Root: FC<CardRootProps> = ({
  children,
  className,
  onSelect,
  active = false,
  ariaLabel,
  hasDecision = false
}) => {
  const handleClick = useCallback(() => {
    onSelect?.();
  }, [ onSelect ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && active) {
      e.preventDefault();
      onSelect?.();
    }
  }, [ onSelect, active ]);

  const baseClassName = Bem.block('tox-card', {
    'selected': active,
    'has-decision': hasDecision
  });
  const cardClassName = Type.isNonNullable(className)
    ? `${baseClassName} ${className}`
    : baseClassName;

  return (
    <div
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={active ? 0 : -1}
      role="button"
      aria-label={ariaLabel ?? 'Card'}
      aria-pressed={active}
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

export type { CardLayout, CardHighlightType } from './CardTypes';
