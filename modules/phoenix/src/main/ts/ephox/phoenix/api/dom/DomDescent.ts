import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Descent from '../general/Descent';

const universe = DomUniverse();
const toLeaf = function (element: Element, offset: number) {
  return Descent.toLeaf(universe, element, offset);
};

/* The purpose of freefall is that they will land on an element that is not whitespace text. This
 * can be very useful inside beautified content
 */
const freefallLtr = function (element: Element) {
  return Descent.freefallLtr(universe, element);
};

const freefallRtl = function (element: Element) {
  return Descent.freefallRtl(universe, element);
};

export {
  toLeaf,
  freefallLtr,
  freefallRtl
};