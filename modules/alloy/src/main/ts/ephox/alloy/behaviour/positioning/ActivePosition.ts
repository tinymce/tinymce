import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { PositioningConfig, PositioningType  } from './PositioningTypes';

const getStyles = (positioningType: PositioningType): Record<string, string> => {
  if (positioningType === 'relative') {
    return { position: 'relative' };
  } else if (positioningType === 'absolute') {
    // Elements with `position: absolute` and without any content collapse, 
    // so theirs width equals 0. That differs from `position: relative` behaviour,
    // which preserves containers width.
    return { position: 'absolute', width: '100%' };
  } else {
    return { };
  }
};

const exhibit = (base: DomDefinitionDetail, posConfig: PositioningConfig): DomModification.DomModification => 
  DomModification.nu({
    classes: [ ],
    styles: getStyles(posConfig.usePositioningType()),
  });

export {
  exhibit
};
