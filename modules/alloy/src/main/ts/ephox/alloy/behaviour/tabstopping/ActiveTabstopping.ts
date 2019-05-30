import { Objects } from '@ephox/boulder';

import * as DomModification from '../../dom/DomModification';
import { TabstoppingConfig } from '../../behaviour/tabstopping/TabstoppingTypes';
const exhibit = (base: { }, tabConfig: TabstoppingConfig): { } => {
  return DomModification.nu({
    attributes: Objects.wrapAll([
      { key: tabConfig.tabAttr, value: 'true' }
    ])
  });
};

export {
  exhibit
};