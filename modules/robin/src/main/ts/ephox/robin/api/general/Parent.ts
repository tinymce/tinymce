import Breaker, { LeftRight } from '../../parent/Breaker';
import Shared, { Looker } from '../../parent/Shared';
import Subset from '../../parent/Subset';
import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';

const sharedOne = function <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) {
  return Shared.oneAll(universe, look, elements);
};

const subset = function <E, D>(universe: Universe<E, D>, start: E, finish: E) {
  return Subset.subset(universe, start, finish);
};

const ancestors = function <E, D>(universe: Universe<E, D>, start: E, finish: E, _isRoot?: (x: E, i: number, xs: ArrayLike<E>) => boolean) {
  return Subset.ancestors(universe, start, finish, _isRoot);
};

const breakToLeft = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return Breaker.breakToLeft(universe, parent, child);
};

const breakToRight = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return Breaker.breakToRight(universe, parent, child);
};

const breakPath = function <E, D>(universe: Universe<E, D>, child: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>) {
  return Breaker.breakPath(universe, child, isTop, breaker);
};

export default {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};