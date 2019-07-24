import { Width, Height } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfig, DragStartData } from './DraggingTypes';

const calcStartData = (dragConfig: DraggingConfig, comp: AlloyComponent): DragStartData => {
  return {
    bounds: dragConfig.getBounds(),
    height: Height.getOuter(comp.element()),
    width: Width.getOuter(comp.element())
  };
};

export {
  calcStartData
};
