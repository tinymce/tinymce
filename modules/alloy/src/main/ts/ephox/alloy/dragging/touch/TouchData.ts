import { Optional } from '@ephox/katamari';
import { EventArgs, SugarPosition } from '@ephox/sugar';

const getDataFrom = (touches: TouchList): Optional<SugarPosition> => {
  const touch = touches[0];
  return Optional.some(SugarPosition(touch.clientX, touch.clientY));
};

const getData = (event: EventArgs<TouchEvent>): Optional<SugarPosition> => {
  const raw = event.raw;
  const touches = raw.touches;
  return touches.length === 1 ? getDataFrom(touches) : Optional.none();
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => SugarPosition(nu.left - old.left, nu.top - old.top);

export {
  getData,
  getDelta
};
