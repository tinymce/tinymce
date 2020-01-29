import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { PositioningConfig } from './PositioningTypes';

const exhibit = (base: DomDefinitionDetail, posConfig: PositioningConfig/*, posState */) => {
  return DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed() ? { } : { position: 'relative' }
  });
};

export {
  exhibit
};
