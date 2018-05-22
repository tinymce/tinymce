import { Option } from '@ephox/katamari';
import { Slider, Behaviour, Composing, Focusing, Tabstopping, AlloyTriggers, Representing } from "ephox/alloy/api/Main";
import { convertRgbToHex } from 'ephox/alloy/demo/colourpicker/ColourChanges';
import { sliderUpdate } from 'ephox/alloy/demo/colourpicker/ColourEvents';
import { RgbColour } from '@ephox/acid';

const renderSlider = () => {
  const stops = '#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000';
  const gradientCssText = (
    'background: -ms-linear-gradient(bottom,' + stops + ');' +
    'background: linear-gradient(to bottom,' + stops + ');'
  );

  var spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'div',
      attributes: {
        title: 'spectrum',
        style: gradientCssText
      },
      classes: [ 'example-slider-spectrum' ]
    }
  });

  var thumb = Slider.parts().thumb({
    dom: {
      tag: 'div',
      innerHtml: 'Thumb',
      attributes: {
        title: 'thumb'
      },
      classes: [ 'example-slider-thumb' ]
    }
  });


  return Slider.sketch({
    dom: {
      tag: 'div',
      attributes: {
        title: 'slider'
      },
      classes: [ 'example-slider' ]
    },
    components: [
      spectrum,
      thumb
    ],
    min: 0,
    max: 100,
    orientation: 'vertical',
    getInitialValue: function () { return 10; },
    sliderBehaviours: Behaviour.derive([
      Composing.config({
        find: Option.some
      }),
      Tabstopping.config({ }),
      Focusing.config({ })
    ]),

    onChange: function (slider) {
      const value = Representing.getValue(slider);
      const rgb = (() => {
        var hue = ((100 - value / 100) * 360);
        var hsv = {
          saturation: 100,
          value: 100,
          hue: hue
        };
        return RgbColour.fromHsv(hsv);
      })();

      const hex = convertRgbToHex(rgb);
      AlloyTriggers.emitWith(slider, sliderUpdate(), {
        hex
      })
    }
  })
};

export {
  renderSlider
};