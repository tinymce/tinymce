import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Extract from '../api/general/Extract';
import Parents from './Parents';
import OrphanText from '../wrap/OrphanText';

var index = function (universe, items, item) {
  return Arr.findIndex(items, Fun.curry(universe.eq, item));
};

var order = function (items, a, delta1, b, delta2) {
  return a < b ? items.slice(a + delta1, b + delta2) : items.slice(b + delta2, a + delta1);
};

/**
 * Returns a flat array of text nodes between two defined nodes.
 *
 * Deltas are a broken concept. They control whether the item passed is included in the result.
 */
var range = function (universe, item1, delta1, item2, delta2) {
  if (universe.eq(item1, item2)) return [item1];

  return Parents.common(universe, item1, item2).fold(function () {
    return []; // no common parent, therefore no intervening path. How does this clash with Path in robin?
  }, function (parent) {
    var items = [ parent ].concat(Extract.all(universe, parent, Fun.constant(false)));
    var start = index(universe, items, item1);
    var finish = index(universe, items, item2);
    var result = start.bind(function (startIndex) {
      return finish.map(function (finishIndex) {
        return order(items, startIndex, delta1, finishIndex, delta2);
      });
    }).getOr([]);
    var orphanText = OrphanText(universe);
    return Arr.filter(result, orphanText.validateText);
  });
};

export default {
  range: range
};