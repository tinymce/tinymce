import { Type } from '@ephox/katamari';
import { useLayoutEffect, useRef, useState, type FC, type PropsWithChildren } from 'react';

import { Icon } from '../../internal/icon/Icon.component';
import * as Bem from '../../utils/Bem';

export interface ExpandableBoxProps extends PropsWithChildren {
  /** Icon resolver */
  iconResolver: (icon: string) => string;
  /** Expanded state */
  expanded?: boolean;
  /** Callback for toggle button */
  onToggle?: (curExpand: boolean) => void;
  /** Text to render when the button is to expand the content */
  expandText?: string;
  /** Text to render when the button is to collapse the content */
  collapseText?: string;
}

export const ExpandableBox: FC<ExpandableBoxProps> = ({
  iconResolver,
  expanded = false,
  onToggle,
  expandText = 'Expand',
  collapseText = 'Collapse',
  children
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [ overflowing, setOverflowing ] = useState(false);

  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    if (Type.isNonNullable(contentEl)) {
      setOverflowing(contentEl.scrollHeight > contentEl.clientHeight);
    }
  }, [ children ]);

  return (
    <div className={Bem.block('tox-expandable-box')}>
      <div ref={contentRef} className={Bem.element('tox-expandable-box', 'content', { expanded, overflowing: overflowing && !expanded })}>
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
