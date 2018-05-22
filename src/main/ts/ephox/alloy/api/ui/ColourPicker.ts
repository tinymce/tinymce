import * as Sketcher from './Sketcher';
import { renderPalette } from 'ephox/alloy/demo/colourpicker/ColourPalette';
import { renderSlider } from 'ephox/alloy/demo/colourpicker/ColourSlider';
import { Memento } from 'ephox/alloy/api/Main';
import { RgbForm } from 'ephox/alloy/demo/colourpicker/RgbForm';

const factory = (detail) => {
  // Making this a simple spec and then we'll introduce where they put the body

  const memRgb = Memento.record(
    RgbForm.sketch({ })
  )

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: [
      memRgb.asSpec(),
      renderSlider(),
      renderPalette()
    ]
  };
}

const ColourPicker = Sketcher.single({
  name: 'ColourPicker',
  configFields: [ ],
  factory: factory
});

export {
  ColourPicker
};