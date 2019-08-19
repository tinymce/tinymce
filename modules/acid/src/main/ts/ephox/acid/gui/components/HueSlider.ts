import { AlloyComponent, AlloyTriggers, Behaviour, Focusing, Slider } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { sliderUpdate } from '../ColourEvents';

const sliderFactory = (translate: (key: string) => string, getClass: (key: string) => string) => {
  const spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'div',
      classes: [ getClass('hue-slider-spectrum') ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  const thumb = Slider.parts().thumb({
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
        role: 'presentation'
      }
    },
    rounded: false,
    model: {
      mode: 'y',
      getInitialValue: Fun.constant({y: Fun.constant(0) })
    },
    components: [
      spectrum,
      thumb
    ],
    sliderBehaviours: Behaviour.derive([
      Focusing.config({ })
    ]),

    onChange: (slider: AlloyComponent, _thumb: any, value: any) => {
      AlloyTriggers.emitWith(slider, sliderUpdate(), {
        value
      });
    }
  });
};

export default {
  sliderFactory
};
