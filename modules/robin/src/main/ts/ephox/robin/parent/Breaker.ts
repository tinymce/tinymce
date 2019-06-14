import { Universe } from '@ephox/boss';
import { Arr, Fun, Option, Struct } from '@ephox/katamari';

interface Bisect<E> {
  before: () => E[];
  after: () => E[];
}

export interface LeftRight<E> {
  left: () => E;
  right: () => E;
}

export interface BrokenPathSplits<E> {
  first: () => E;
  second: () => E;
}

export interface BrokenPath<E> {
  first: () => E;
  second: () => Option<E>;
  splits: () => BrokenPathSplits<E>[];
}

const leftRight: <E> (left: E, right: E) => LeftRight<E> = Struct.immutable('left', 'right');

const brokenPath: <E> (first: E, second: Option<E>, splits: BrokenPathSplits<E>[]) => BrokenPath<E> = Struct.immutable('first', 'second', 'splits');

const bisect = function <E, D>(universe: Universe<E, D>, parent: E, child: E): Option<Bisect<E>> {
  const children = universe.property().children(parent);
  const index = Arr.findIndex(children, Fun.curry(universe.eq, child));
  return index.map(function (ind) {
    return {
      before: Fun.constant(children.slice(0, ind)),
      after: Fun.constant(children.slice(ind + 1))
    };
  });
};

/**
 * Clone parent to the RIGHT and move everything after child in the parent element into
 * a clone of the parent (placed after parent).
 */
const breakToRight = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return bisect(universe, parent, child).map(function (parts) {
    const second = universe.create().clone(parent);
    universe.insert().appendAll(second, parts.after());
    universe.insert().after(parent, second);
    return leftRight(parent, second);
  });
};

/**
 * Clone parent to the LEFT and move everything before and including child into
 * the a clone of the parent (placed before parent)
 */
const breakToLeft = function <E, D>(universe: Universe<E, D>, parent: E, child: E) {
  return bisect(universe, parent, child).map(function (parts) {
    const prior = universe.create().clone(parent);
    universe.insert().appendAll(prior, parts.before().concat([child]));
    universe.insert().appendAll(parent, parts.after());
    universe.insert().before(parent, prior);
    return leftRight(prior, parent);
  });
};

/*
 * Using the breaker, break from the child up to the top element defined by the predicate.
 * It returns three values:
 *   first: the top level element that completed the break
 *   second: the optional element representing second part of the top-level split if the breaking completed successfully to the top
 *   splits: a list of (Element, Element) pairs that represent the splits that have occurred on the way to the top.
 */
const breakPath = function <E, D>(universe: Universe<E, D>, item: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>) {

  const next = function (child: E, group: Option<E>, splits: BrokenPathSplits<E>[]): BrokenPath<E> {
    const fallback = brokenPath(child, Option.none(), splits);
    // Found the top, so stop.
    if (isTop(child)) {
      return brokenPath(child, group, splits);
    } else {
      // Split the child at parent, and keep going
      return universe.property().parent(child).bind(function (parent: E) {
        return breaker(universe, parent, child).map(function (breakage) {
          const extra = [{ first: breakage.left, second: breakage.right }];
          // Our isTop is based on the left-side parent, so keep it regardless of split.
          const nextChild = isTop(parent) ? parent : breakage.left();
          return next(nextChild, Option.some(breakage.right()), splits.concat(extra));
        });
      }).getOr(fallback);
    }
  };

  return next(item, Option.none(), []);
};

export { breakToLeft, breakToRight, breakPath };
