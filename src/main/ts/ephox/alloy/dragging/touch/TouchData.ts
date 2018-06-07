import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { PositionCoordinates, SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';

const getDataFrom = function (touches): Option<PositionCoordinates> {
  const touch = touches[0];
  return Option.some(Position(touch.clientX, touch.clientY));
};

const getData = function (event: SugarEvent): Option<PositionCoordinates> {
  const raw = event.raw() as TouchEvent;
  const touches = raw.touches;
  return touches.length === 1 ? getDataFrom(touches) : Option.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = function (old: PositionCoordinates, nu: PositionCoordinates): PositionCoordinates {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

export {
  getData,
  getDelta
};