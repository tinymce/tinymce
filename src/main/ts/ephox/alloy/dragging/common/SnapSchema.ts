import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Scroll } from '@ephox/sugar';

var defaultLazyViewport = function () {
  var scroll = Scroll.get();

  return {
    x: scroll.left,
    y: scroll.top,
    w: Fun.constant(window.innerWidth),
    h: Fun.constant(window.innerHeight),
    fx: Fun.constant(0),
    fy: Fun.constant(0)
  };
};

export default <any> FieldSchema.optionObjOf('snaps', [
  FieldSchema.strict('getSnapPoints'),
  Fields.onHandler('onSensor'),
  FieldSchema.strict('leftAttr'),
  FieldSchema.strict('topAttr'),
  FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
]);