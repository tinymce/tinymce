import { Fun } from '@ephox/katamari';
import { Direction } from '@ephox/sugar';

const ltr = {
  isRtl: Fun.constant(false)
};

const rtl = {
  isRtl: Fun.constant(true)
};

// Get the directionality from the position in the content
const directionAt = Direction.onDirection(ltr, rtl);

export { directionAt };
