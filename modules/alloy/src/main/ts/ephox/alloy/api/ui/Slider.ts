import SliderParts from '../../ui/slider/SliderParts';
import { SliderSchema } from '../../ui/slider/SliderSchema';
import * as SliderUi from '../../ui/slider/SliderUi';
import { SliderSketcher } from '../../ui/types/SliderTypes';
import * as Sketcher from './Sketcher';

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
}) as SliderSketcher;

export {
  Slider
};
