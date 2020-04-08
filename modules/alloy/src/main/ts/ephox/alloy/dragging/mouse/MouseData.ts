import { MouseEvent } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { EventArgs, Position } from '@ephox/sugar';

const getData = (event: EventArgs<MouseEvent>): Option<Position> => Option.from(Position(event.x(), event.y()));

// When dragging with the mouse, the delta is simply the difference
// between the two position (previous/old and next/nu)
const getDelta = (old: Position, nu: Position): Position => Position(nu.left() - old.left(), nu.top() - old.top());

export {
  getData,
  getDelta
};
