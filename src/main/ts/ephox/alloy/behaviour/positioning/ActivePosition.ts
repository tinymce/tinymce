import * as DomModification from '../../dom/DomModification';
import { PositioningConfig } from 'ephox/alloy/behaviour/positioning/PositioningTypes';

const exhibit = function (base: { }, posConfig: PositioningConfig/*, posState */): { } {
  return DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed() ? { } : { position: 'relative' }
  });
};

export {
  exhibit
};