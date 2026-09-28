import { useId, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';

export interface CardGroupProps extends PropsWithChildren {
  /** Heading rendered above the cards of the group */
  readonly title: string;
}

/**
 * Groups any number of cards of a CardList under one heading.
 */
export const CardGroup: FC<CardGroupProps> = ({ children, title }) => {
  const titleId = useId();

  return (
    <div className={Bem.block('tox-card-group')}>
      <div id={titleId} className={Bem.element('tox-card-group', 'title')}>
        {title}
      </div>
      <div
        className={Bem.element('tox-card-group', 'content')}
        role="group"
        aria-labelledby={titleId}
      >
        {children}
      </div>
    </div>
  );
};
