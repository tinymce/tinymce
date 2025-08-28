import { Universe } from '@ephox/boss';
import { Arr, Fun, Optional } from '@ephox/katamari';

interface SubsetAncestors<E> {
  readonly firstpath: E[];
  readonly secondpath: E[];
  readonly shared: Optional<E>;
}

const eq = <E, D>(universe: Universe<E, D>, item: E): (e: E) => boolean => {
  return Fun.curry(universe.eq, item);
};

const unsafeSubset = <E, D>(universe: Universe<E, D>, common: E, ps1: E[], ps2: E[]): Optional<E[]> => {
  const children = universe.property().children(common);
  if (universe.eq(common, ps1[0])) {
    return Optional.some([ ps1[0] ]);
  }
  if (universe.eq(common, ps2[0])) {
    return Optional.some([ ps2[0] ]);
  }

  const finder = (ps: E[]) => {
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
  return startIndex.bind((sIndex) => {
    return endIndex.map((eIndex) => {
      // This is required because the range could be backwards.
      const first = Math.min(sIndex, eIndex);
      const last = Math.max(sIndex, eIndex);

      return children.slice(first, last + 1);
    });
  });
};

// Note: this can be exported if it is required in the future.
const ancestors = <E, D>(universe: Universe<E, D>, start: E, end: E, isRoot: (x: E) => boolean = Fun.never): SubsetAncestors<E> => {
  // Inefficient if no isRoot is supplied.
  // TODO: Andy knows there is a graph-based algorithm to find a common parent, but can't remember it
  //        This also includes something to get the subset after finding the common parent
  const ps1 = [ start ].concat(universe.up().all(start));
  const ps2 = [ end ].concat(universe.up().all(end));

  const prune = (path: E[]) => {
    const index = Arr.findIndex(path, isRoot);
    return index.fold(() => {
      return path;
    }, (ind) => {
      return path.slice(0, ind + 1);
    });
  };

  const pruned1 = prune(ps1);
  const pruned2 = prune(ps2);

  const shared = Arr.find(pruned1, (x) => {
    return Arr.exists(pruned2, eq(universe, x));
  });

  return {
    firstpath: pruned1,
    secondpath: pruned2,
    shared
  };
};

/**
 * Find the common element in the parents of start and end.
 *
 * Then return all children of the common element such that start and end are included.
 */
const subset = <E, D>(universe: Universe<E, D>, start: E, end: E): Optional<E[]> => {
  const ancs = ancestors(universe, start, end);
  return ancs.shared.bind((shared) => {
    return unsafeSubset(universe, shared, ancs.firstpath, ancs.secondpath);
  });
};

export {
  subset,
  ancestors
};
