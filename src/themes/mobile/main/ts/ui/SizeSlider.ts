import { Behaviour } from '@ephox/alloy';
import { Receiving } from '@ephox/alloy';
import { Toggling } from '@ephox/alloy';
import { Slider } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';
import UiDomFactory from '../util/UiDomFactory';

var schema = ValueSchema.objOfOnly([
  FieldSchema.strict('getInitialValue'),
  FieldSchema.strict('onChange'),
  FieldSchema.strict('category'),
  FieldSchema.strict('sizes')
]);

var sketch = function (rawSpec) {
  var spec = ValueSchema.asRawOrDie('SizeSlider', schema, rawSpec);

  var isValidValue = function (valueIndex) {
    return valueIndex >= 0 && valueIndex < spec.sizes.length;
  };

  var onChange = function (slider, thumb, valueIndex) {
    if (isValidValue(valueIndex)) {
      spec.onChange(valueIndex);
    }
  };

  return Slider.sketch({
    dom: {
      tag: 'div',
      classes: [
        Styles.resolve('slider-' + spec.category + '-size-container'),
        Styles.resolve('slider'),
        Styles.resolve('slider-size-container') ]
    },
    onChange: onChange,
    onDragStart: function (slider, thumb) {
      Toggling.on(thumb);
    },
    onDragEnd: function (slider, thumb) {
      Toggling.off(thumb);
    },
    min: 0,
    max: spec.sizes.length - 1,
    stepSize: 1,
    getInitialValue: spec.getInitialValue,
    snapToGrid: true,

    sliderBehaviours: Behaviour.derive([
      Receivers.orientation(Slider.refresh)
    ]),

    components: [
      Slider.parts().spectrum({
        dom: UiDomFactory.dom('<div class="${prefix}-slider-size-container"></div>'),
        components: [
          UiDomFactory.spec('<div class="${prefix}-slider-size-line"></div>')
        ]
      }),
      
      Slider.parts().thumb({
        dom: UiDomFactory.dom('<div class="${prefix}-slider-thumb"></div>'),
        behaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: Styles.resolve('thumb-active')
          })
        ])
      })
    ]
  });
};

export default <any> {
  sketch: sketch
};