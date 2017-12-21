import { Fun } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Height } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var pointed = Struct.immutable('point', 'width', 'height');
var rect = Struct.immutable('x', 'y', 'width', 'height');

var bounds = function (x, y, width, height) {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y),
    width: Fun.constant(width),
    height: Fun.constant(height),
    right: Fun.constant(x + width),
    bottom: Fun.constant(y + height)
  };
};

var box = function (element) {
  var xy = Location.absolute(element);
  var w = Width.getOuter(element);
  var h = Height.getOuter(element);
  return bounds(xy.left(), xy.top(), w, h);
};

export default <any> {
  pointed: pointed,
  rect: rect,
  bounds: bounds,
  box: box
};