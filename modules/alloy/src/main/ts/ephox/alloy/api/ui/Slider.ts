import SliderParts from '../../ui/slider/SliderParts';
import { SliderSchema } from '../../ui/slider/SliderSchema';
import * as SliderUi from '../../ui/slider/SliderUi';
import { SliderApis, SliderDetail, SliderSketcher, SliderSpec } from '../../ui/types/SliderTypes';
import * as Sketcher from './Sketcher';

const Slider: SliderSketcher = Sketcher.composite<SliderSpec, SliderDetail, SliderApis>({
  name: 'Slider',
  configFields: SliderSchema,
  partFields: SliderParts,
  factory: SliderUi.sketch,
  apis: {
    resetToMin: (apis, slider) => {
      apis.resetToMin(slider);
    },
    resetToMax: (apis, slider) => {
      apis.resetToMax(slider);
    },
    refresh: (apis, slider) => {
      apis.refresh(slider);
    }
  }
});

export {
  Slider
};
