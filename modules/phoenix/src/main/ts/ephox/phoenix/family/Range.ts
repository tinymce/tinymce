import { Universe } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';
import * as Extract from '../api/general/Extract';
import { OrphanText } from '../wrap/OrphanText';
import * as Parents from './Parents';

const index = function <E, D> (universe: Universe<E, D>, items: E[], item: E) {
  return Arr.findIndex(items, Fun.curry(universe.eq, item));
};

const order = function <E> (items: E[], a: number, delta1: number, b: number, delta2: number) {
  return a < b ? items.slice(a + delta1, b + delta2) : items.slice(b + delta2, a + delta1);
};

/**
 * Returns a flat array of text nodes between two defined nodes.
 *
 * Deltas are a broken concept. They control whether the item passed is included in the result.
 */
const range = function <E, D> (universe: Universe<E, D>, item1: E, delta1: number, item2: E, delta2: number): E[] {
  if (universe.eq(item1, item2)) {
    return [ item1 ];
  }

  return Parents.common(universe, item1, item2).fold<E[]>(function () {
    return []; // no common parent, therefore no intervening path. How does this clash with Path in robin?
  }, function (parent) {
    const items = [ parent ].concat(Extract.all<E, D>(universe, parent, Fun.constant(false)));
    const start = index(universe, items, item1);
    const finish = index(universe, items, item2);
    const result = start.bind(function (startIndex) {
      return finish.map(function (finishIndex) {
        return order(items, startIndex, delta1, finishIndex, delta2);
      });
    }).getOr([]);
    const orphanText = OrphanText(universe);
    return Arr.filter(result, orphanText.validateText);
  });
};

export {
  range
};
