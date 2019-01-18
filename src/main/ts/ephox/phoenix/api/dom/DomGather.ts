import { DomUniverse } from '@ephox/boss';
import Gather from '../general/Gather';

var universe = DomUniverse();

var before = function (element, isRoot) {
  return Gather.before(universe, element, isRoot);
};

var after = function (element, isRoot) {
  return Gather.after(universe, element, isRoot);
};

var seekLeft = function (element, predicate, isRoot) {
  return Gather.seekLeft(universe, element, predicate, isRoot);
};

var seekRight = function (element, predicate, isRoot) {
  return Gather.seekRight(universe, element, predicate, isRoot);
};

var walkers = function () {
  return Gather.walkers();
};

var walk = function (item, mode, direction, _rules?) {
  return Gather.walk(universe, item, mode, direction, _rules);
};

export default {
  before,
  after,
  seekLeft,
  seekRight,
  walkers,
  walk,
  // Due to exact references being required, these can't go through the DOM layer.
  // Outside modules need to be able to creates sets of rules which use the exports directly,
  // because when we are applying the rules we use a simple equality check to work out which
  // rule is which. If we delegate here, the memory address of the API rule and the internal
  // rule will be different.
  // backtrack: backtrack,
  // sidestep: sidestep,
  // advance: advance
};