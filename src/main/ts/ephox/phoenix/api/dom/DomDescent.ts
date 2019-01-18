import { DomUniverse } from '@ephox/boss';
import Descent from '../general/Descent';

var universe = DomUniverse();
var toLeaf = function (element, offset) {
  return Descent.toLeaf(universe, element, offset);
};

/* The purpose of freefall is that they will land on an element that is not whitespace text. This
 * can be very useful inside beautified content
 */
var freefallLtr = function (element) {
  return Descent.freefallLtr(universe, element);
};

var freefallRtl = function (element) {
  return Descent.freefallRtl(universe, element);
};

export default {
  toLeaf: toLeaf,
  freefallLtr: freefallLtr,
  freefallRtl: freefallRtl
};