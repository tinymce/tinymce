import * as Sketcher from './Sketcher';
import { renderPalette } from 'ephox/alloy/demo/colourpicker/ColourPalette';
import { renderSlider } from 'ephox/alloy/demo/colourpicker/ColourSlider';
import { Memento, AddEventsBehaviour, Behaviour, AlloyEvents, AlloyTriggers } from 'ephox/alloy/api/Main';
import { RgbForm } from 'ephox/alloy/demo/colourpicker/RgbForm';
import { Css } from '@ephox/sugar';

import * as ColourEvents from 'ephox/alloy/demo/colourpicker/ColourEvents';
import { Palette } from 'ephox/alloy/api/ui/Palette';
import { convertHexToRgb, convertRgbToHex } from 'ephox/alloy/demo/colourpicker/ColourChanges';

const factory = (detail) => {
  // Making this a simple spec and then we'll introduce where they put the body

  const memRgb = Memento.record(
    RgbForm.sketch({ })
  )

  const memPreview = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: [ 'mce-preview' ],
        styles: {
          'width': '200px',
          height: '200px',
          border: '1px solid black'
        }
      }
    }
  )

  const memPalette = Memento.record(
    renderPalette({
      onChange: (palette, thumb, xyValue, imageData) => {
        const rgb = { red: imageData[0], green: imageData[1], blue: imageData[2] };
        const hex = convertRgbToHex(rgb);
        AlloyTriggers.emitWith(palette, ColourEvents.updatePreview(), {
          hex: hex
        })
      }

    })
  );

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: [
      memRgb.asSpec(),
      renderSlider(),
      memPalette.asSpec(),
      memPreview.asSpec()
    ],
    
    behaviours: Behaviour.derive([
      AddEventsBehaviour.config('colour-picker-events', [
        AlloyEvents.run(ColourEvents.updatePreview(), (comp, simulatedEvent) => {
          const hex = simulatedEvent.event().hex();
          memPreview.getOpt(comp).each((preview) => {
            Css.set(preview.element(), 'background-color', '#' + hex);
          })

          memRgb.getOpt(comp).each((form) => {
            RgbForm.updateHex(form, hex);
          });

          memPalette.getOpt(comp).each((palette) => {
            const rgb = convertHexToRgb(hex);
            // Groan.
            if (rgb !== null) {
              Palette.refreshColour(palette, { red: rgb.r, green: rgb.g, blue: rgb.b, alpha: 1.0 });
            }
          })
        })
      ])
    ])
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