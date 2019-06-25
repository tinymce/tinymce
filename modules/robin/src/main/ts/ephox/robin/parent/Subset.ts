import { Universe } from '@ephox/boss';
import { Arr, Fun, Option } from '@ephox/katamari';

const eq = function <E, D>(universe: Universe<E, D>, item: E) {
  return Fun.curry(universe.eq, item);
};

const unsafeSubset = function <E, D>(universe: Universe<E, D>, common: E, ps1: E[], ps2: E[]) {
  const children = universe.property().children(common);
  if (universe.eq(common, ps1[0])) {
    return Option.some([ps1[0]]);
  }
  if (universe.eq(common, ps2[0])) {
    return Option.some([ps2[0]]);
  }

  const finder = function (ps: E[]) {
    // ps is calculated bottom-up, but logically we're searching top-down
    const topDown = Arr.reverse(ps);

    // find the child of common in the ps array
    const index = Arr.findIndex(topDown, eq(universe, common)).getOr(-1);
    const item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];

    // find the index of that child in the common children
    return Arr.findIndex(children, eq(universe, item));
  };

  const startIndex = finder(ps1);
  const endIndex = finder(ps2);

  // Return all common children between first and last
  return startIndex.bind(function (sIndex) {
    return endIndex.map(function (eIndex) {
      // This is required because the range could be backwards.
      const first = Math.min(sIndex, eIndex);
      const last = Math.max(sIndex, eIndex);

      return children.slice(first, last + 1);
    });
  });
};

// Note: this can be exported if it is required in the future.
const ancestors = function <E, D>(universe: Universe<E, D>, start: E, end: E, isRoot: (x: E) => boolean = Fun.never) {
  // Inefficient if no isRoot is supplied.
  // TODO: Andy knows there is a graph-based algorithm to find a common parent, but can't remember it
  //        This also includes something to get the subset after finding the common parent
  const ps1 = [start].concat(universe.up().all(start));
  const ps2 = [end].concat(universe.up().all(end));

  const prune = function (path: E[]) {
    const index = Arr.findIndex(path, isRoot);
    return index.fold(function () {
      return path;
    }, function (ind) {
      return path.slice(0, ind + 1);
    });
  };

  const pruned1 = prune(ps1);
  const pruned2 = prune(ps2);

  const shared = Arr.find(pruned1, function (x) {
    return Arr.exists(pruned2, eq(universe, x));
  });

  return {
    firstpath: Fun.constant(pruned1),
    secondpath: Fun.constant(pruned2),
    shared: Fun.constant(shared)
  };
};

/**
 * Find the common element in the parents of start and end.
 *
 * Then return all children of the common element such that start and end are included.
 */
const subset = function <E, D>(universe: Universe<E, D>, start: E, end: E) {
  const ancs = ancestors(universe, start, end);
  return ancs.shared().bind(function (shared) {
    return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
  });
};

export default {
  subset,
  ancestors
};