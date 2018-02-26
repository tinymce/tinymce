import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

const getDataFrom = function (touches) {
  const touch = touches[0];
  return Option.some(Position(touch.clientX, touch.clientY));
};

const getData = function (event) {
  const touches = event.raw().touches;
  return touches.length === 1 ? getDataFrom(touches) : Option.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = function (old, nu) {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

export {
  getData,
  getDelta
};