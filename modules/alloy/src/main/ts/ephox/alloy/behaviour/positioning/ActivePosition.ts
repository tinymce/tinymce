import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { PositioningConfig, PositioningType  } from './PositioningTypes';

const getStyles = (positioningType: PositioningType): Record<string, string> => {
  if (positioningType === 'relative') {
    return { position: 'relative' };
  } else if (positioningType === 'absolute') {
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
