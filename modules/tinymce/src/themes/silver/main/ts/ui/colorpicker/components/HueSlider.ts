import { AlloyComponent, AlloyTriggers, Behaviour, Focusing, SketchSpec, Slider } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import { sliderUpdate } from '../ColourEvents';

const sliderFactory = (translate: (key: string) => string, getClass: (key: string) => string): SketchSpec => {
  const spectrum = Slider.parts.spectrum({
    dom: {
      tag: 'div',
      classes: [ getClass('hue-slider-spectrum') ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  const thumb = Slider.parts.thumb({
    dom: {
      tag: 'div',
      classes: [ getClass('hue-slider-thumb') ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  return Slider.sketch({
    dom: {
      tag: 'div',
      classes: [ getClass('hue-slider') ],
      attributes: {
        'role': 'slider',
        'aria-valuemin': 0,
        'aria-valuemax': 360,
        'aria-valuenow': 120,
      }
    },
    rounded: false,
    model: {
      mode: 'y',
      getInitialValue: Fun.constant(0)
    },
    components: [
      spectrum,
      thumb
    ],
    sliderBehaviours: Behaviour.derive([
      Focusing.config({ })
    ]),

    onChange: (slider: AlloyComponent, _thumb: any, value: any) => {
      Attribute.set(slider.element, 'aria-valuenow', Math.floor(360 - (value * 3.6)));
      AlloyTriggers.emitWith(slider, sliderUpdate, {
        value
      });
    }
  });
};

export {
  sliderFactory
};
