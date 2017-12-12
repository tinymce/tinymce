import Sketcher from './Sketcher';
import SliderParts from '../../ui/slider/SliderParts';
import SliderSchema from '../../ui/slider/SliderSchema';
import SliderUi from '../../ui/slider/SliderUi';



export default <any> Sketcher.composite({
  name: 'Slider',
  configFields: SliderSchema,
  partFields: SliderParts,
  factory: SliderUi.sketch,
  apis: {
    resetToMin: function (apis, slider) {
      apis.resetToMin(slider);
    },
    resetToMax: function (apis, slider) {
      apis.resetToMax(slider);
    },
    refresh: function (apis, slider) {
      apis.refresh(slider);
    }
  }
});