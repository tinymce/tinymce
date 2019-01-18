import { DomUniverse } from '@ephox/boss';
import Family from '../general/Family';

var universe = DomUniverse();

var range = function (start, startDelta, finish, finishDelta) {
  return Family.range(universe, start, startDelta, finish, finishDelta);
};

var group = function (elements, optimise) {
  return Family.group(universe, elements, optimise);
};

export default {
  range: range,
  group: group
};