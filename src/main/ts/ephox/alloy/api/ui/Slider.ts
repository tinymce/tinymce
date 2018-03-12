import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

import SliderParts from '../../ui/slider/SliderParts';
import { SliderSchema } from '../../ui/slider/SliderSchema';
import * as SliderUi from '../../ui/slider/SliderUi';
import * as Sketcher from './Sketcher';

export interface SliderSketch extends Sketcher.CompositeSketch {
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}

const Slider = Sketcher.composite({
  name: 'Slider',
  configFields: SliderSchema,
  partFields: SliderParts,
  factory: SliderUi.sketch,
  apis: {
    resetToMin (apis, slider) {
      apis.resetToMin(slider);
    },
    resetToMax (apis, slider) {
      apis.resetToMax(slider);
    },
    refresh (apis, slider) {
      apis.refresh(slider);
    }
  }
}) as SliderSketch;

export {
  Slider
};