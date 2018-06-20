import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Scroll } from '@ephox/sugar';

import * as Fields from '../../data/Fields';
import { Bounds } from '../../alien/Boxes';
import { window } from '@ephox/dom-globals';

const defaultLazyViewport = (): Bounds => {
  const scroll = Scroll.get();

  return {
    x: scroll.left,
    y: scroll.top,
    width: Fun.constant(window.innerWidth),
    height: Fun.constant(window.innerHeight),
    bottom: Fun.constant(scroll.top() + window.innerHeight),
    right: Fun.constant(scroll.left() + window.innerWidth)
  };
};

export default FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
]);