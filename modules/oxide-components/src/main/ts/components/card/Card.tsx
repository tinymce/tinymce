import { Arr, Id, Type } from '@ephox/katamari';
import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useMemo, useRef, type FC, type MouseEvent as ReactMouseEvent, type PropsWithChildren, type ReactElement } from 'react';

import * as Bem from '../../utils/Bem';

import { useCardListContext } from './CardListContext';
import type { CardHeaderActionsVisibility, CardHighlightType, CardLayout } from './CardTypes';

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

export interface CardHeaderContentProps extends PropsWithChildren {}

export interface CardHeaderActionsProps extends PropsWithChildren {
  /**
   * Controls when header actions are revealed. Defaults to hover (also revealed on focus-within).
   */
  readonly visibilityMode?: CardHeaderActionsVisibility;
}

export interface CardBodyProps extends PropsWithChildren {}

export interface CardActionsProps extends PropsWithChildren {
  readonly layout?: CardLayout;
}

export interface CardHighlightProps extends PropsWithChildren {
  readonly type: CardHighlightType;
}

export interface CardExpansionProps extends PropsWithChildren {
  /**
   * Optional unique identifier for this expansion.
   * Useful when multiple expansions exist in a list and parent needs stable identification.
   */
  readonly id?: string;
  /**
   * Open state (controlled).
   */
  readonly open: boolean;
  /**
   * Called when the open state changes.
   */
  readonly onOpenChange: (open: boolean) => void;
  readonly className?: string;
}

export interface CardExpansionTriggerProps extends PropsWithChildren {
  readonly className?: string;
}

export interface CardExpansionContentProps extends PropsWithChildren {
  readonly className?: string;
}

interface CardExpansionContextValue {
  readonly open: boolean;
  readonly toggle: () => void;
  readonly contentId: string;
  readonly triggerId: string;
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
    'selected': !loading && (isFocused || selected),
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
      tabIndex={loading ? undefined : -1}
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

const HeaderContent: FC<CardHeaderContentProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-card', 'header-content')}>
      {children}
    </div>
  );
};

const HeaderActions: FC<CardHeaderActionsProps> = ({ children, visibilityMode = 'hover' }) => {
  return (
    <div className={Bem.element('tox-card', 'header-actions', {
      'always-visible': visibilityMode === 'always',
      'hover-visible': visibilityMode === 'hover',
      'on-focus': visibilityMode === 'focus'
    })}>
      {children}
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

const CardExpansionContext = createContext<CardExpansionContextValue | null>(null);

const useCardExpansion = (): CardExpansionContextValue => {
  const context = useContext(CardExpansionContext);
  if (context === null) {
    throw new Error('Card Expansion components must be used within Card.Expansion');
  }
  return context;
};

const Expansion: FC<CardExpansionProps> = ({
  children,
  id,
  open,
  onOpenChange,
  className
}) => {
  const reactId = useId();
  const fallbackId = useMemo(() => Id.generate('card-expansion'), []);

  let baseId = fallbackId;
  if (Type.isNonNullable(id)) {
    baseId = id;
  } else if (reactId.length > 0) {
    baseId = reactId;
  }

  const toggle = useCallback(() => {
    onOpenChange(!open);
  }, [ open, onOpenChange ]);

  const contextValue = useMemo<CardExpansionContextValue>(() => ({
    open,
    toggle,
    contentId: `${baseId}-content`,
    triggerId: `${baseId}-trigger`
  }), [ open, toggle, baseId ]);

  const expansionClassName = Bem.element('tox-card', 'expansion')
    + (Type.isNonNullable(className) ? ` ${className}` : '');

  return (
    <CardExpansionContext.Provider value={contextValue}>
      <div className={expansionClassName}>
        {children}
      </div>
    </CardExpansionContext.Provider>
  );
};

/**
 * Trigger that toggles the expansion. Requires a single interactive child element.
 *
 * Enter and Space toggle via native button click behavior.
 */
const ExpansionTrigger: FC<CardExpansionTriggerProps> = ({ children, className }) => {
  const { open, toggle, contentId, triggerId } = useCardExpansion();

  const handleClick = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    toggle();
  }, [ toggle ]);

  const childArray = Children.toArray(children);
  const singleChild = childArray.length === 1 ? childArray[0] : null;

  if (!isValidElement(singleChild)) {
    throw new Error('Card.ExpansionTrigger requires exactly one valid React element child');
  }

  const child = singleChild as ReactElement<{
    'onClick'?: (e: ReactMouseEvent) => void;
    'className'?: string;
    'id'?: string;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
  }>;

  let mergedClassName = child.props.className;
  if (Type.isNonNullable(className)) {
    if (Type.isNonNullable(mergedClassName)) {
      mergedClassName = `${mergedClassName} ${className}`;
    } else {
      mergedClassName = className;
    }
  }

  return cloneElement(child, {
    'id': child.props.id ?? triggerId,
    'aria-expanded': open,
    'aria-controls': contentId,
    'className': mergedClassName,
    'onClick': (e: ReactMouseEvent) => {
      child.props.onClick?.(e);
      if (!e.defaultPrevented) {
        handleClick(e);
      }
    }
  });
};

const ExpansionContent: FC<CardExpansionContentProps> = ({ children, className }) => {
  const { open, contentId, triggerId } = useCardExpansion();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (Type.isNullable(element)) {
      return;
    }
    if (open) {
      element.removeAttribute('inert');
    } else {
      element.setAttribute('inert', '');
    }
  }, [ open ]);

  const contentClassName = Bem.element('tox-card', 'expansion-content', {
    expanded: open,
    collapsed: !open
  }) + (Type.isNonNullable(className) ? ` ${className}` : '');

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!open}
      className={contentClassName}
    >
      <div className={Bem.element('tox-card', 'expansion-content-inner')}>
        {children}
      </div>
    </div>
  );
};

export {
  Root,
  Header,
  HeaderContent,
  HeaderActions,
  Body,
  Actions,
  Highlight,
  Expansion,
  ExpansionTrigger,
  ExpansionContent
};

export { CardList, CardListController } from './CardList';
export type { CardLayout, CardHighlightType, CardHeaderActionsVisibility } from './CardTypes';
