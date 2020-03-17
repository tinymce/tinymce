import { TouchEvent, TouchList } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { EventArgs, Position } from '@ephox/sugar';

const getDataFrom = (touches: TouchList): Option<Position> => {
  const touch = touches[0];
  return Option.some(Position(touch.clientX, touch.clientY));
};

const getData = (event: EventArgs<TouchEvent>): Option<Position> => {
  const raw = event.raw();
  const touches = raw.touches;
  return touches.length === 1 ? getDataFrom(touches) : Option.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = (old: Position, nu: Position): Position => Position(nu.left() - old.left(), nu.top() - old.top());

export {
  getData,
  getDelta
};
