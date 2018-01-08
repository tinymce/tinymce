import { Behaviour } from '@ephox/alloy';
import { Receiving } from '@ephox/alloy';
import { Toggling } from '@ephox/alloy';
import { Slider } from '@ephox/alloy';
import { Css } from '@ephox/sugar';
import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';
import ToolbarWidgets from './ToolbarWidgets';
import UiDomFactory from '../util/UiDomFactory';

var BLACK = -1;

var makeSlider = function (spec) {
  var getColor = function (hue) {
    // Handle edges.
    if (hue < 0) {
      return 'black';
    } else if (hue > 360) {
      return 'white';
    } else {
      return 'hsl(' + hue + ', 100%, 50%)';
    }
  };

  // Does not fire change intentionally.
  var onInit = function (slider, thumb, value) {
    var color = getColor(value);
    Css.set(thumb.element(), 'background-color', color);
  };

  var onChange = function (slider, thumb, value) {
    var color = getColor(value);
    Css.set(thumb.element(), 'background-color', color);
    spec.onChange(slider, thumb, color);
  };

  return Slider.sketch({
    dom: UiDomFactory.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
    components: [
      Slider.parts()['left-edge'](UiDomFactory.spec('<div class="${prefix}-hue-slider-black"></div>')),
      Slider.parts().spectrum({
        dom: UiDomFactory.dom('<div class="${prefix}-slider-gradient-container"></div>'),
        components: [
          UiDomFactory.spec('<div class="${prefix}-slider-gradient"></div>')
        ],
        behaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: Styles.resolve('thumb-active')
          })
        ])
      }),
      Slider.parts()['right-edge'](UiDomFactory.spec('<div class="${prefix}-hue-slider-white"></div>')),
      Slider.parts().thumb({
        dom: UiDomFactory.dom('<div class="${prefix}-slider-thumb"></div>'),
        behaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: Styles.resolve('thumb-active')
          })
        ])
      })
    ],

    onChange: onChange,
    onDragStart: function (slider, thumb) {
      Toggling.on(thumb);
    },
    onDragEnd: function (slider, thumb) {
      Toggling.off(thumb);
    },
    onInit: onInit,
    stepSize: 10,
    min: 0,
    max: 360,
    getInitialValue: spec.getInitialValue,

    sliderBehaviours: Behaviour.derive([
      Receivers.orientation(Slider.refresh)
    ])
  });
};

var makeItems = function (spec) {
  return [
    makeSlider(spec)
  ];
};

var sketch = function (realm, editor) {
  var spec = {
    onChange: function (slider, thumb, color) {
      editor.undoManager.transact(function () {
        editor.formatter.apply('forecolor', { value: color });
        editor.nodeChanged();
      });
    },
    getInitialValue: function (/* slider */) {
      // Return black
      return BLACK;
    }
  };

  return ToolbarWidgets.button(realm, 'color', function () {
    return makeItems(spec);
  });
};

export default <any> {
  makeItems: makeItems,
  sketch: sketch
};