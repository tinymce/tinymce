import { Objects } from '@ephox/boulder';

import * as DomModification from '../../dom/DomModification';
const exhibit = function (base, tabConfig) {
  return DomModification.nu({
    attributes: Objects.wrapAll([
      { key: tabConfig.tabAttr(), value: 'true' }
    ])
  });
};

export {
  exhibit
};