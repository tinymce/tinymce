import { Universe } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';

const eq = <E, D>(universe: Universe<E, D>, e1: E): (e2: E) => boolean => {
  return Fun.curry(universe.eq, e1);
};

const isDuplicate = <E, D>(universe: Universe<E, D>, rest: E[], item: E): boolean => {
  return Arr.exists(rest, eq(universe, item));
};

const isChild = <E, D>(universe: Universe<E, D>, rest: E[], item: E): boolean => {
  const parents = universe.up().all(item);
  return Arr.exists(parents, (p) => {
    return isDuplicate(universe, rest, p);
  });
};

/**
 * Flattens the item list into just the top-most elements in the tree.
 *
 * In other words, removes duplicates and children.
 */
const simplify = <E, D>(universe: Universe<E, D>, items: E[]): E[] => {
// FIX: Horribly inefficient.
  return Arr.filter(items, (x, i) => {
    const left = items.slice(0, i);
    const right = items.slice(i + 1);
    const rest = left.concat(right);
    return !(isDuplicate(universe, right, x) || isChild(universe, rest, x));
  });
};

export {
  simplify
};
