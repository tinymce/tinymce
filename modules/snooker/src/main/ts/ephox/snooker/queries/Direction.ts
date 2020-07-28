import { Fun } from '@ephox/katamari';
import { Direction, SugarElement } from '@ephox/sugar';

const ltr = {
  isRtl: Fun.constant(false)
};

const rtl = {
  isRtl: Fun.constant(true)
};

// Get the directionality from the position in the content
const directionAt = (element: SugarElement<Element>) => Direction.getDirection(element) === 'rtl' ? rtl : ltr;

export {
  directionAt
};
