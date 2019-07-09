import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { Direction, Transition } from '../api/data/Types';
import * as Walker from './Walker';
import { Walkers } from './Walkers';

const hone = function <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, mode: Transition, direction: Direction, isRoot: (e: E) => boolean): Option<E> {
  const next = Walker.go(universe, item, mode, direction);
  return next.bind(function (n) {
    if (isRoot(n.item())) {
      return Option.none();
    } else {
      return predicate(n.item()) ? Option.some(n.item()) : hone(universe, n.item(), predicate, n.mode(), direction, isRoot);
    }
  });
};

const left = function <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean) {
  return hone(universe, item, predicate, Walker.sidestep, Walkers.left(), isRoot);
};

const right = function <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean) {
  return hone(universe, item, predicate, Walker.sidestep, Walkers.right(), isRoot);
};

export {
  left,
  right
};
