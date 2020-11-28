import { Objects } from '@ephox/boulder';

import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { TabstoppingConfig } from './TabstoppingTypes';

const exhibit = (base: DomDefinitionDetail, tabConfig: TabstoppingConfig): DomModification.DomModification =>
  DomModification.nu({
    attributes: Objects.wrapAll([
      { key: tabConfig.tabAttr, value: 'true' }
    ])
  });

export {
  exhibit
};
