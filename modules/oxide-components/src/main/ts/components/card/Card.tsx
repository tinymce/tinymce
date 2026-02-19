import { Arr, Type } from '@ephox/katamari';
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
  /**
   * When true, displays skeleton loading state instead of children.
   * Disables interactions and shows aria-busy attribute.
   */
  readonly loading?: boolean;
}

export interface CardHeaderProps extends PropsWithChildren {
  readonly title?: string;
}

export interface CardBodyProps extends PropsWithChildren {}

export interface CardActionsProps extends PropsWithChildren {
  readonly layout?: CardLayout;
}

export interface CardHighlightProps extends PropsWithChildren {
  readonly type: CardHighlightType;
}

const renderSkeletonLines = (lines: number) =>
  Arr.range(lines, (i) => (
    <div key={i} className={Bem.element('tox-skeleton', 'line')} style={{ width: '100%' }} />
  ));

const Root: FC<CardRootProps> = ({
  children,
  className,
  onSelect,
  selected = false,
  ariaLabel,
  hasDecision = false,
  index,
  loading = false
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
  })
    + (loading ? ' tox-skeleton' : '')
    + (Type.isNonNullable(className) ? ` ${className}` : '');

  const skeletonContent = (
    <>
      <div className={Bem.element('tox-card', 'body')}>
        {renderSkeletonLines(1)}
      </div>
      <div className={Bem.element('tox-card', 'actions')}>
        <div className={Bem.element('tox-skeleton', 'line')} style={{ width: '50%' }} />
      </div>
    </>
  );

  return (
    <div
      className={cardClassName}
      onClick={loading ? undefined : handleClick}
      onKeyDown={loading ? undefined : handleKeyDown}
      onFocus={loading ? undefined : handleFocus}
      tabIndex={-1}
      role="option"
      aria-label={ariaLabel ?? `Card ${(index ?? 0) + 1}`}
      aria-selected={isSelected}
      aria-busy={loading}
    >
      {loading ? skeletonContent : children}
    </div>
  );
};

const Header: FC<CardHeaderProps> = ({ children, title }) => {
  return (
    <div className={Bem.element('tox-card', 'header')}>
      {Type.isNonNullable(title) ? title : children}
    </div>
  );
};

const Body: FC<CardBodyProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-card', 'body')}>
      {children}
    </div>
  );
};

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

export { CardList, CardListController } from './CardList';
export type { CardLayout, CardHighlightType } from './CardTypes';
