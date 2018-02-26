import SliderParts from '../../ui/slider/SliderParts';
import SliderSchema from '../../ui/slider/SliderSchema';
import SliderUi from '../../ui/slider/SliderUi';
import * as Sketcher from './Sketcher';

export default <any> Sketcher.composite({
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
});