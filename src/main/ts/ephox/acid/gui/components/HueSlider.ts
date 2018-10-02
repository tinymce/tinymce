import { Option, Fun } from '@ephox/katamari';
import { Slider, Behaviour, Composing, Focusing, Tabstopping, AlloyTriggers } from '@ephox/alloy';
import { sliderUpdate } from '../ColourEvents';

const sliderFactory = (translate, getClass) => {
  var spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'div',
      classes: [ getClass('hue-slider-spectrum') ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  var thumb = Slider.parts().thumb({
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

    onChange: function (slider, thumb, value) {
      AlloyTriggers.emitWith(slider, sliderUpdate(), {
        value
      });
    }
  })
};

export default {
  sliderFactory
};