import DomModification from '../../dom/DomModification';
import { Objects } from '@ephox/boulder';

var exhibit = function (base, tabConfig) {
  return DomModification.nu({
    attributes: Objects.wrapAll([
      { key: tabConfig.tabAttr(), value: 'true' }
    ])
  });
};

export default <any> {
  exhibit: exhibit
};