import { Arr, Fun, Type } from '@ephox/katamari';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type FC, type PropsWithChildren } from 'react';

import { Icon } from '../icon/Icon';

interface AccordionContextValue {
  readonly expandedItems: string[];
  readonly toggleItem: (id: string) => void;
  readonly allowMultiple: boolean;
  readonly registerItem: (id: string, ref: HTMLButtonElement | null) => void;
  readonly unregisterItem: (id: string) => void;
  readonly getItemRefs: () => Map<string, HTMLButtonElement>;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = (): AccordionContextValue => {
  const context = useContext(AccordionContext);
  if (context === null) {
    throw new Error('Accordion components must be used within Accordion.Root');
  }
  return context;
};

export interface AccordionRootProps extends PropsWithChildren {
  /**
   * Allow multiple accordion items to be expanded simultaneously.
   * @default false
   */
  readonly allowMultiple?: boolean;

  /**
   * Array of item IDs that should be expanded by default (uncontrolled mode).
   * @default []
   */
  readonly defaultExpanded?: string[];

  /**
   * Array of item IDs that are currently expanded (controlled mode).
   * When provided, the component becomes controlled.
   */
  readonly expanded?: string[];

  /**
   * Callback fired when the expanded state changes (controlled mode).
   * @param expanded - Array of currently expanded item IDs
   */
  readonly onExpandedChange?: (expanded: string[]) => void;
}

/**
 * Accordion component for displaying collapsible content sections.
 *
 * Supports both controlled and uncontrolled modes, keyboard navigation,
 * and proper accessibility attributes.
 *
 * @example
 * ```html
 * <!-- Simple native HTML accordion -->
 * <details>
 *   <summary>Section 1</summary>
 *   <div>Content goes here</div>
 * </details>
 *
 * <!-- For enhanced features, use the Accordion component -->
 * <Accordion.Root>
 *   <Accordion.Item id="item1" title="Section 1">
 *     Content goes here
 *   </Accordion.Item>
 * </Accordion.Root>
 * ```
 */
const Root: FC<AccordionRootProps> = ({
  children,
  allowMultiple = false,
  defaultExpanded = [],
  expanded: controlledExpanded,
  onExpandedChange
}) => {
  const [ uncontrolledExpanded, setUncontrolledExpanded ] = useState<string[]>(defaultExpanded);
  const itemRefsMap = useMemo(() => new Map<string, HTMLButtonElement>(), []);

  const isControlled = Type.isNonNullable(controlledExpanded);
  const expandedItems = isControlled ? controlledExpanded : uncontrolledExpanded;

  const toggleItem = useCallback((id: string) => {
    let newExpanded: string[];
    if (Arr.contains(expandedItems, id)) {
      newExpanded = Arr.filter(expandedItems, (item) => item !== id);
    } else if (allowMultiple) {
      newExpanded = [ ...expandedItems, id ];
    } else {
      newExpanded = [ id ];
    }

    if (isControlled) {
      onExpandedChange?.(newExpanded);
    } else {
      setUncontrolledExpanded(newExpanded);
    }
  }, [ expandedItems, allowMultiple, isControlled, onExpandedChange ]);

  const registerItem = useCallback((id: string, ref: HTMLButtonElement | null) => {
    if (Type.isNonNullable(ref)) {
      itemRefsMap.set(id, ref);
    }
  }, [ itemRefsMap ]);

  const unregisterItem = useCallback((id: string) => {
    itemRefsMap.delete(id);
  }, [ itemRefsMap ]);

  const getItemRefs = Fun.constant(itemRefsMap);

  const contextValue = useMemo<AccordionContextValue>(() => ({
    expandedItems,
    toggleItem,
    allowMultiple,
    registerItem,
    unregisterItem,
    getItemRefs
  }), [ expandedItems, toggleItem, allowMultiple, registerItem, unregisterItem, getItemRefs ]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className="tox-accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps extends PropsWithChildren {
  /**
   * Unique identifier for this accordion item.
   * Used to track expanded state and for accessibility attributes.
   */
  readonly id: string;

  /**
   * Title text displayed in the accordion header button.
   */
  readonly title: string;

  /**
   * Disable the accordion item, preventing user interaction.
   * @default false
   */
  readonly disabled?: boolean;

  /**
   * Semantic heading level for the accordion header.
   * Important for document outline and screen readers.
   * @default 'h3'
   */
  readonly headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  /**
   * Position of the chevron icon in the header.
   * @default 'start'
   */
  readonly iconPosition?: 'start' | 'end';
}

/**
 * Individual accordion item containing a header button and collapsible content.
 * Must be used as a child of Accordion.Root.
 */
const Item: FC<AccordionItemProps> = ({
  id,
  title,
  disabled = false,
  headingLevel = 'h3',
  iconPosition = 'start',
  children
}) => {
  const { expandedItems, toggleItem, registerItem, unregisterItem, getItemRefs } = useAccordion();
  const contentId = useId();
  const headerId = useId();

  const isExpanded = Arr.contains(expandedItems, id);
  const HeadingTag = headingLevel;

  useEffect(() => {
    return () => {
      unregisterItem(id);
    };
  }, [ id, unregisterItem ]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      toggleItem(id);
    }
  }, [ disabled, toggleItem, id ]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    const itemRefs = Array.from(getItemRefs().entries());
    const currentIndex = Arr.findIndex(itemRefs, ([ itemId ]) => itemId === id);

    if (currentIndex.isNone()) {
      return;
    }

    const index = currentIndex.getOrDie();

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleItem(id);
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (index < itemRefs.length - 1) {
          const nextRef = itemRefs[index + 1][1];
          nextRef?.focus();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (index > 0) {
          const prevRef = itemRefs[index - 1][1];
          prevRef?.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        if (itemRefs.length > 0) {
          const firstRef = itemRefs[0][1];
          firstRef?.focus();
        }
        break;

      case 'End':
        event.preventDefault();
        if (itemRefs.length > 0) {
          const lastRef = itemRefs[itemRefs.length - 1][1];
          lastRef?.focus();
        }
        break;
    }
  }, [ disabled, toggleItem, id, getItemRefs ]);

  const headerClassName = `tox-accordion__header${isExpanded ? ' tox-accordion__header--expanded' : ''}${disabled ? ' tox-accordion__header--disabled' : ''}${iconPosition === 'end' ? ' tox-accordion__header--icon-end' : ''}`;
  const contentClassName = `tox-accordion__content${isExpanded ? ' tox-accordion__content--expanded' : ' tox-accordion__content--collapsed'}`;

  const iconElement = (
    <span className="tox-accordion__header-icon">
      <Icon icon={isExpanded ? 'chevron-up' : 'chevron-down'} />
    </span>
  );

  const titleElement = (
    <span className="tox-accordion__header-text">
      {title}
    </span>
  );

  return (
    <div className="tox-accordion__item">
      <HeadingTag className="tox-accordion__heading">
        <button
          id={headerId}
          ref={(ref) => registerItem(id, ref)}
          type="button"
          className={headerClassName}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          {iconPosition === 'start' ? (
            <>
              {iconElement}
              {titleElement}
            </>
          ) : (
            <>
              {titleElement}
              {iconElement}
            </>
          )}
        </button>
      </HeadingTag>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!isExpanded}
        className={contentClassName}
      >
        <div className="tox-accordion__content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export {
  Root,
  Item
};

