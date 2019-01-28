/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Slider, Toggling, SketchSpec } from '@ephox/alloy';
import { Css } from '@ephox/sugar';

import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';
import * as ToolbarWidgets from './ToolbarWidgets';

const BLACK = -1;

const makeSlider = function (spec) {
  const getColor = function (hue) {
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
  const onInit = function (slider, thumb, spectrum, value) {
    const color = getColor(value.x());
    Css.set(thumb.element(), 'background-color', color);
  };

  const onChange = function (slider, thumb, value) {
    const color = getColor(value.x());
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

    onChange,
    onDragStart (slider, thumb) {
      Toggling.on(thumb);
    },
    onDragEnd (slider, thumb) {
      Toggling.off(thumb);
    },
    onInit,
    stepSize: 10,
    model: {
      mode: 'x',
      minX: 0,
      maxX: 360,
      getInitialValue: () => {
        return {
          x: () => spec.getInitialValue()
        };
      }
    },

    sliderBehaviours: Behaviour.derive([
      Receivers.orientation(Slider.refresh)
    ])
  });
};

const makeItems = function (spec): SketchSpec[] {
  return [
    makeSlider(spec)
  ];
};

const sketch = function (realm, editor) {
  const spec = {
    onChange (slider, thumb, color) {
      editor.undoManager.transact(function () {
        editor.formatter.apply('forecolor', { value: color });
        editor.nodeChanged();
      });
    },
    getInitialValue (/* slider */) {
      // Return black
      return BLACK;
    }
  };

  return ToolbarWidgets.button(realm, 'color-levels', function () {
    return makeItems(spec);
  }, editor);
};

export default {
  makeItems,
  sketch
};