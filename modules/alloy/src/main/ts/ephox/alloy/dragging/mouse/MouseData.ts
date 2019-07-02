import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';

const getData = (event: SugarEvent): Option<SugarPosition> => {
  return Option.from(Position(event.x(), event.y()));
};

// When dragging with the mouse, the delta is simply the difference
// between the two position (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

export {
  getData,
  getDelta
};
