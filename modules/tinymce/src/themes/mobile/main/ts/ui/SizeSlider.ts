/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Slider, Toggling, SketchSpec } from '@ephox/alloy';
import { FieldSchema, ValueSchema } from '@ephox/boulder';

import * as Receivers from '../channels/Receivers';
import * as Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';

const schema = ValueSchema.objOfOnly([
  FieldSchema.strict('getInitialValue'),
  FieldSchema.strict('onChange'),
  FieldSchema.strict('category'),
  FieldSchema.strict('sizes')
]);

const sketch = function (rawSpec): SketchSpec {
  const spec = ValueSchema.asRawOrDie('SizeSlider', schema, rawSpec);

  const isValidValue = function (valueIndex) {
    return valueIndex >= 0 && valueIndex < spec.sizes.length;
  };

  const onChange = function (slider, thumb, valueIndex) {
    const index = valueIndex.x();
    if (isValidValue(index)) {
      spec.onChange(index);
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
    onChange,
    onDragStart(slider, thumb) {
      Toggling.on(thumb);
    },
    onDragEnd(slider, thumb) {
      Toggling.off(thumb);
    },
    model: {
      mode: 'x',
      minX: 0,
      maxX: spec.sizes.length - 1,
      getInitialValue: () => ({
        x: () => spec.getInitialValue()
      })
    },
    stepSize: 1,
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

export {
  sketch
};
