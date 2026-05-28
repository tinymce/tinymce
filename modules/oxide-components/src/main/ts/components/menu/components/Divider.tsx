import type { FunctionComponent } from 'react';

import * as Bem from '../../../utils/Bem';

export const Divider: FunctionComponent = () => {
  return (
    <div
      role='separator'
      className={Bem.element('tox-collection', 'item-separator')}
    />
  );
};