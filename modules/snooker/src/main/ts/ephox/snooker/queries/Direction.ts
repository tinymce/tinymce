import { Element as DomElement } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Direction, Element } from '@ephox/sugar';

const ltr = {
  isRtl: Fun.constant(false)
};

const rtl = {
  isRtl: Fun.constant(true)
};

// Get the directionality from the position in the content
const directionAt = function (element: Element<DomElement>) {
  const dir = Direction.getDirection(element);
  return dir === 'rtl' ? rtl : ltr;
};

export default {
  directionAt
};