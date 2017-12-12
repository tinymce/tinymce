import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

var getDataFrom = function (touches) {
  var touch = touches[0];
  return Option.some(Position(touch.clientX, touch.clientY));
};

var getData = function (event) {
  var touches = event.raw().touches;
  return touches.length === 1 ? getDataFrom(touches) : Option.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
var getDelta = function (old, nu) {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

export default <any> {
  getData: getData,
  getDelta: getDelta
};