import { Type } from '@ephox/katamari';
import { useLayoutEffect, useRef, useState, type FC, type PropsWithChildren } from 'react';

import { Icon } from '../../internal/icon/Icon.component';
import * as Bem from '../../utils/Bem';

export interface ExpandableBoxProps extends PropsWithChildren {
  /** Icon resolver */
  readonly iconResolver: (icon: string) => string;
  /** Max height the content can be before it becomes expandable */
  readonly maxHeight?: number;
  /** Expanded state */
  readonly expanded?: boolean;
  /** Callback for toggle button */
  readonly onToggle?: (curExpand: boolean) => void;
  /** Text to render when the button is to expand the content */
  readonly expandText?: string;
  /** Text to render when the button is to collapse the content */
  readonly collapseText?: string;
}

/** Expandable container box */
export const ExpandableBox: FC<ExpandableBoxProps> = ({
  iconResolver,
  maxHeight = 80,
  expanded = false,
  onToggle,
  expandText = 'Expand',
  collapseText = 'Collapse',
  children
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [ overflowing, setOverflowing ] = useState(false);
  const contentClass = Bem.element('tox-expandable-box', 'content', { expanded, overflowing: overflowing && !expanded });

  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    if (Type.isNonNullable(contentEl)) {
      setOverflowing(contentEl.scrollHeight > maxHeight);
    }
  }, [ children ]);

  return (
    <div className={Bem.block('tox-expandable-box')}>
      <div ref={contentRef} className={contentClass} style={{ maxHeight: expanded ? 'none' : `${maxHeight}px` }}>
        {children}
      </div>
      {
        overflowing && <button type="button" className={Bem.element('tox-expandable-box', 'toggle-button')} onClick={() => onToggle?.(expanded)}>
          <Icon resolver={iconResolver} icon={expanded ? 'chevron-up' : 'chevron-down'} />
          {expanded ? collapseText : expandText}
        </button>
      }
    </div>
  );
};
