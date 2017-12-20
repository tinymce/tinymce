import { Fun } from '@ephox/katamari';

var r = function (left, top) {
  var translate = function (x, y) {
    return r(left + x, top + y);
  };

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    translate: translate
  };
};

export default <any> r;