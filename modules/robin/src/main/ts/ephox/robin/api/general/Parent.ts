import { LeftRight, breakToLeft as xBreakToLeft, breakToRight as xBreakToRight, breakPath as xBreakPath } from '../../parent/Breaker';
import { Looker, oneAll } from '../../parent/Shared';
import Subset from '../../parent/Subset';
import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';

const sharedOne = function <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) {
  return oneAll(universe, look, elements);
};

const subset = function <E, D>(universe: Universe<E, D>, start: E, finish: E) {
  return Subset.subset(universe, start, finish);
};

const ancestors = function <E, D>(universe: Universe<E, D>, start: E, finish: E, isRoot?: (x: E) => boolean) {
  return Subset.ancestors(universe, start, finish, isRoot);
};

const breakToLeft = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return xBreakToLeft(universe, parent, child);
};

const breakToRight = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return xBreakToRight(universe, parent, child);
};

const breakPath = function <E, D>(universe: Universe<E, D>, child: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>) {
  return xBreakPath(universe, child, isTop, breaker);
};

export default {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};