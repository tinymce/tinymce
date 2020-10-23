import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

/**
 * Search the parents of both items for a common element
 */
const common = function <E, D> (universe: Universe<E, D>, item1: E, item2: E) {
  const item1parents = [ item1 ].concat(universe.up().all(item1));
  const item2parents = [ item2 ].concat(universe.up().all(item2));

  return Arr.find(item1parents, function (x) {
    return Arr.exists(item2parents, function (y) {
      return universe.eq(y, x);
    });
  });
};

export {
  common
};
