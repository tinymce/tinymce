import { Adt } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfigSpec } from '../../dragging/common/DraggingTypes';

export interface OriginAdt extends Adt { }

const setSnap = (component: AlloyComponent, config: DraggingConfigSpec, state: any, sConfig: number): void => {
};

export {
  setSnap
};
