import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

import { SugarPosition, SugarEvent } from '../../alien/TypeDefinitions';
import { TouchEvent } from '@ephox/dom-globals';

const getDataFrom = (touches): Option<SugarPosition> => {
  const touch = touches[0];
  return Option.some(Position(touch.clientX, touch.clientY));
};

const getData = (event: SugarEvent): Option<SugarPosition> => {
  const raw = event.raw() as TouchEvent;
  const touches = raw.touches;
  return touches.length === 1 ? getDataFrom(touches) : Option.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

export {
  getData,
  getDelta
};