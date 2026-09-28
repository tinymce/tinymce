import { Type } from '@ephox/katamari';
import { useId, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';

export interface CardGroupProps extends PropsWithChildren {
  /** Heading rendered above the cards of the group */
  readonly title: string;
  /**
   * Already formatted secondary text rendered at the end of the heading, e.g. how many cards of the group still
   * need a decision. The component stays generic, so the caller does the translating and the number formatting.
   */
  readonly status?: string;
}

/**
 * Groups any number of cards of a CardList under one heading.
 */
export const CardGroup: FC<CardGroupProps> = ({ children, status, title }) => {
  const titleId = useId();
  const statusId = useId();
  const hasStatus = Type.isNonNullable(status);

  // Every part of the heading joins the accessible name of the group, in the order the heading reads
  const labelIds = hasStatus ? `${titleId} ${statusId}` : titleId;

  return (
    <div className={Bem.block('tox-card-group')}>
      <div className={Bem.element('tox-card-group', 'title')}>
        <span id={titleId} className={Bem.element('tox-card-group', 'title-text')}>
          {title}
        </span>
        {hasStatus && (
          <span id={statusId} className={Bem.element('tox-card-group', 'status')}>
            {status}
          </span>
        )}
      </div>
      <div
        className={Bem.element('tox-card-group', 'content')}
        role="group"
        aria-labelledby={labelIds}
      >
        {children}
      </div>
    </div>
  );
};
