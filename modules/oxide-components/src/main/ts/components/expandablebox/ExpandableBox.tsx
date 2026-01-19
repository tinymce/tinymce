import { Type } from '@ephox/katamari';
import { useLayoutEffect, useRef, useState, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';

export interface ExpandableBoxProps extends PropsWithChildren {
  /** Max height the content can be before it becomes expandable */
  readonly maxHeight?: number;
  /** Expanded state */
  readonly expanded?: boolean;
  /** Callback for toggle button */
  readonly onToggle?: () => void;
  /** Text to render when the button is to expand the content */
  readonly expandLabel?: string;
  /** Text to render when the button is to collapse the content */
  readonly collapseLabel?: string;
}

/** Expandable container box */
export const ExpandableBox: FC<ExpandableBoxProps> = ({
  maxHeight = 80,
  expanded = false,
  onToggle,
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
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
  }, [ children, maxHeight ]);

  return (
    <div className={Bem.block('tox-expandable-box')}>
      <div ref={contentRef} className={contentClass} style={{ maxHeight: expanded ? undefined : `${maxHeight}px` }}>
        {children}
      </div>
      {
        overflowing && <Button variant="naked" type="button" onClick={() => onToggle?.()} className="tox-expandable-box__toggle">
          <Icon icon={expanded ? 'chevron-up' : 'chevron-down'} />
          {expanded ? collapseLabel : expandLabel}
        </Button>
      }
    </div>
  );
};
