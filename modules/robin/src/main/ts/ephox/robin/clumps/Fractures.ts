import { Universe } from '@ephox/boss';
import { Arr, Fun, Optional } from '@ephox/katamari';
import * as Parent from '../api/general/Parent';
import { breakToLeft, breakToRight, BrokenPath, LeftRight } from '../parent/Breaker';
import * as Subset from '../parent/Subset';

// Find the subsection of DIRECT children of parent from [first, last])
const slice = function <E, D> (universe: Universe<E, D>, parent: E, first: Optional<E>, last: Optional<E>): Optional<E[]> {
  const children = universe.property().children(parent);

  const finder = function (elem: E) {
    return Arr.findIndex(children, Fun.curry(universe.eq, elem));
  };

  // Default to the start of the common parent.
  const firstIndex = first.bind(finder).getOr(0);
  // Default to the end of the common parent.
  const lastIndex = last.bind(finder).getOr(children.length - 1);
  return firstIndex > -1 && lastIndex > -1 ? Optional.some(children.slice(firstIndex, lastIndex + 1)) : Optional.none<E[]>();
};

const breakPath = function <E, D> (universe: Universe<E, D>, element: E, common: E, breaker: (universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>): BrokenPath<E> {
  const isTop = function (elem: E) {
    return universe.property().parent(elem).fold(
      Fun.always,
      Fun.curry(universe.eq, common)
    );
  };

  return Parent.breakPath(universe, element, isTop, breaker);
};

const breakLeft = function <E, D> (universe: Universe<E, D>, element: E, common: E): Optional<E> {
  // If we are the top and we are the left, use default value
  if (universe.eq(common, element)) {
    return Optional.none<E>();
  } else {
    const breakage = breakPath(universe, element, common, breakToLeft);
    // Move the first element into the second section of the split because we want to include element in the section.
    if (breakage.splits.length > 0) {
      universe.insert().prepend(breakage.splits[0].second, element);
    }
    return Optional.some(breakage.second.getOr(element));
  }
};

const breakRight = function <E, D> (universe: Universe<E, D>, element: E, common: E): Optional<E> {
  // If we are the top and we are the right, use default value
  if (universe.eq(common, element)) {
    return Optional.none<E>();
  } else {
    const breakage = breakPath(universe, element, common, breakToRight);
    return Optional.some(breakage.first);
  }
};

const same = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, ceiling: (e: E) => E): Optional<E[]> {
  const common = ceiling(element);
  // If there are no important formatting elements above, just return element, otherwise split to important element above.
  return universe.eq(common, element) ? Optional.some([ element ]) : breakToCommon(universe, common, element, element);
};

const breakToCommon = function <E, D> (universe: Universe<E, D>, common: E, start: E, finish: E): Optional<E[]> {
  // We have the important top-level shared ancestor, we now have to split from the start and finish up
  // to the shared parent. Break from the first node to the common parent AFTER the second break as the first
  // will impact the second (assuming LEFT to RIGHT) and not vice versa.
  const secondBreak = breakRight(universe, finish, common);
  const firstBreak = breakLeft(universe, start, common);
  return slice(universe, common, firstBreak, secondBreak);
};

// Find the shared ancestor that we are going to split up to.
const shared = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E): Optional<E> {
  const subset = Subset.ancestors(universe, start, finish, isRoot);
  return subset.shared.orThunk(function () {
    // Default to shared root, if we don't have a shared ancestor.
    return Parent.sharedOne(universe, function (_, elem) {
      return isRoot(elem) ? Optional.some(elem) : universe.up().predicate(elem, isRoot);
    }, [ start, finish ]);
  }).map(ceiling);
};

const diff = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E): Optional<E[]> {
  return shared(universe, isRoot, start, finish, ceiling).bind(function (common) {
    return breakToCommon(universe, common, start, finish);
  });
};

const fracture = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E = Fun.identity): Optional<E[]> {
  return universe.eq(start, finish) ? same(universe, isRoot, start, ceiling) : diff(universe, isRoot, start, finish, ceiling);
};

export {
  fracture
};
