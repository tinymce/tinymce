import { Arr, Optional, Type } from '@ephox/katamari';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';
import { Icon } from '../icon/Icon';

interface AccordionContextValue {
  readonly expandedItems: string[];
  readonly toggleItem: (id: string) => void;
  readonly allowMultiple: boolean;
}

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select';

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const contextValue = useMemo<AccordionContextValue>(() => ({
    expandedItems,
    toggleItem,
    allowMultiple
  }), [ expandedItems, toggleItem, allowMultiple ]);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef,
    selector: '.tox-accordion__item:not([aria-disabled="true"])',
    allowVertical: true,
    allowHorizontal: false,
    cycles: false,
    focusIn: true,
    execute: (focused) => {
      const activeElement = document.activeElement;
      const isInteractive = activeElement?.matches(INTERACTIVE_SELECTOR) ?? false;
      if (isInteractive) {
        return Optional.none();
      } else {
        focused.dom.click();
        return Optional.some(true);
      }
    }
  });

  return (
    <AccordionContext.Provider value={contextValue}>
      <div ref={containerRef} className="tox-accordion" tabIndex={0}>
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
  const { expandedItems, toggleItem } = useAccordion();
  const contentId = `tox-${id}-content`;
  const headerId = `tox-${id}-header`;

  const isExpanded = Arr.contains(expandedItems, id);
  const HeadingTag = headingLevel;

  const handleClick = useCallback(() => {
    if (!disabled) {
      toggleItem(id);
    }
  }, [ disabled, toggleItem, id ]);

  const handleItemClick = useCallback((e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    const clickedHeader = target.closest(Bem.elementSelector('tox-accordion', 'header'));
    if (!clickedHeader && target !== currentTarget) {
      return;
    }

    if (target !== currentTarget) {
      const isInteractive = target.matches(INTERACTIVE_SELECTOR) ||
        target.closest(INTERACTIVE_SELECTOR);
      if (isInteractive) {
        return;
      }
    }

    currentTarget.focus();

    if (!disabled) {
      toggleItem(id);
    }
  }, [ disabled, toggleItem, id ]);

  const handleItemKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    const activeElement = document.activeElement;
    const isInteractive = activeElement?.matches(INTERACTIVE_SELECTOR) ?? false;
    if (isInteractive) {
      return;
    }

    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (target === currentTarget) {
      e.preventDefault();
      if (!disabled) {
        toggleItem(id);
      }
    } else {
      const isInteractiveTarget = target.matches(INTERACTIVE_SELECTOR) ||
        target.closest(INTERACTIVE_SELECTOR);
      if (isInteractiveTarget) {
        return;
      }

      e.preventDefault();
      if (!disabled) {
        toggleItem(id);
      }
    }
  }, [ disabled, toggleItem, id ]);

  const handleItemEscape = useCallback((e: ReactKeyboardEvent) => {
    if (e.key !== 'Escape') {
      return;
    }

    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (target !== currentTarget) {
      e.preventDefault();
      currentTarget.focus();
      const isInteractive = target.matches(INTERACTIVE_SELECTOR) ||
        target.hasAttribute('contenteditable') ||
        target.getAttribute('role') === 'textbox';

      if (!isInteractive) {
        e.stopPropagation();
      }
    }
  }, []);

  const itemClassName = Bem.element('tox-accordion', 'item', {
    expanded: isExpanded,
  });

  const headerClassName = Bem.element('tox-accordion', 'header', {
    'expanded': isExpanded,
    disabled,
    'icon-end': iconPosition === 'end'
  });
  const contentClassName = Bem.element('tox-accordion', 'content', {
    expanded: isExpanded,
    collapsed: !isExpanded
  });

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
    <div
      className={itemClassName}
      tabIndex={-1}
      aria-disabled={disabled}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        const clickedHeader = target.closest(Bem.elementSelector('tox-accordion', 'header'));
        if (Type.isNonNullable(clickedHeader) || (target === currentTarget)) {
          e.currentTarget.focus();
          e.preventDefault();
        }
      }}
      onClick={handleItemClick}
      onKeyDown={(e) => {
        handleItemKeyDown(e);
        handleItemEscape(e);
      }}
    >
      <HeadingTag className="tox-accordion__heading">
        <button
          id={headerId}
          type="button"
          className={headerClassName}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-disabled={disabled}
          onClick={handleClick}
          disabled={disabled}
          tabIndex={-1}
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

