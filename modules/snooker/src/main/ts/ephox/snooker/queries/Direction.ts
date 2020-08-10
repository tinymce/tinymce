import { Fun } from '@ephox/katamari';
import { Direction } from '@ephox/sugar';

type onDirection = { isRtl: () => boolean };

const ltr: onDirection = {
  isRtl: Fun.never
};

const rtl: onDirection = {
  isRtl: Fun.always
};

// Get the directionality from the position in the content
const directionAt = Direction.onDirection<onDirection>(ltr, rtl);

export { directionAt };

