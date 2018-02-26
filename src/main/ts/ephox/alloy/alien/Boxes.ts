import { Fun, Struct } from '@ephox/katamari';
import { Height, Location, Width } from '@ephox/sugar';

const pointed = Struct.immutable('point', 'width', 'height');
const rect = Struct.immutable('x', 'y', 'width', 'height');

const bounds = function (x, y, width, height) {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y),
    width: Fun.constant(width),
    height: Fun.constant(height),
    right: Fun.constant(x + width),
    bottom: Fun.constant(y + height)
  };
};

const box = function (element) {
  const xy = Location.absolute(element);
  const w = Width.getOuter(element);
  const h = Height.getOuter(element);
  return bounds(xy.left(), xy.top(), w, h);
};

export {
  pointed,
  rect,
  bounds,
  box
};