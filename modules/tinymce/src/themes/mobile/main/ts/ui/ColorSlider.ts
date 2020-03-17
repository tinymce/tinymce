/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Slider, Toggling, SketchSpec } from '@ephox/alloy';
import { Css } from '@ephox/sugar';

import * as Receivers from '../channels/Receivers';
import * as Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';
import * as ToolbarWidgets from './ToolbarWidgets';
import Editor from 'tinymce/core/api/Editor';
import { MobileRealm } from '../ui/IosRealm';

const BLACK = -1;

const makeSlider = (spec): SketchSpec => {
  const getColor = (hue: number): string => {
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
  const onInit = (slider, thumb, spectrum, value): void => {
    const color = getColor(value.x());
    Css.set(thumb.element(), 'background-color', color);
  };

  const onChange = (slider, thumb, value): void => {
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
    onDragStart(slider, thumb) {
      Toggling.on(thumb);
    },
    onDragEnd(slider, thumb) {
      Toggling.off(thumb);
    },
    onInit,
    stepSize: 10,
    model: {
      mode: 'x',
      minX: 0,
      maxX: 360,
      getInitialValue: () => ({
        x: () => spec.getInitialValue()
      })
    },

    sliderBehaviours: Behaviour.derive([
      Receivers.orientation(Slider.refresh)
    ])
  });
};

const makeItems = (spec): SketchSpec[] => [
  makeSlider(spec)
];

const sketch = (realm: MobileRealm, editor: Editor) => {
  const spec = {
    onChange(slider, thumb, color) {
      editor.undoManager.transact(() => {
        editor.formatter.apply('forecolor', { value: color });
        editor.nodeChanged();
      });
    },
    getInitialValue(/* slider */) {
      // Return black
      return BLACK;
    }
  };

  return ToolbarWidgets.button(realm, 'color-levels', () => makeItems(spec), editor);
};

export {
  makeItems,
  sketch
};
