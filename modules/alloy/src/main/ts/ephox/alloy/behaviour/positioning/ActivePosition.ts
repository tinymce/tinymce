import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { PositioningConfig } from './PositioningTypes';

const exhibit = (base: DomDefinitionDetail, posConfig: PositioningConfig): DomModification.DomModification =>
  DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed() ? { } : { position: 'absolute', width: '100%' }
  });

export {
  exhibit
};
