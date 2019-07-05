import * as DomModification from '../../dom/DomModification';
import { PositioningConfig } from './PositioningTypes';

const exhibit = (base: { }, posConfig: PositioningConfig/*, posState */): { } => {
  return DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed ? { } : { position: 'relative' }
  });
};

export {
  exhibit
};
