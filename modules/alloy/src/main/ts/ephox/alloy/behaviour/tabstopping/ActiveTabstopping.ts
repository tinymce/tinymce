import { Objects } from '@ephox/boulder';

import type { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';

import type { TabstoppingConfig } from './TabstoppingTypes';

const exhibit = (base: DomDefinitionDetail, tabConfig: TabstoppingConfig): DomModification.DomModification =>
  DomModification.nu({
    attributes: Objects.wrapAll([
      { key: tabConfig.tabAttr, value: 'true' }
    ])
  });

export {
  exhibit
};
