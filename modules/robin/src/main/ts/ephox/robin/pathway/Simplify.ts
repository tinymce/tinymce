import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var eq = function (universe, e1) {
  return Fun.curry<any, [any], boolean>(universe.eq, e1);
};

var isDuplicate = function (universe, rest, item) {
  return Arr.exists(rest, eq(universe, item));
};

var isChild = function (universe, rest, item) {
  var parents = universe.up().all(item);
  return Arr.exists(parents, function (p) {
    return isDuplicate(universe, rest, p);
  });
};

/**
 * Flattens the item list into just the top-most elements in the tree.
 *
 * In other words, removes duplicates and children.
 */
var simplify = function (universe, items) {
// FIX: Horribly inefficient.
  return Arr.filter(items, function (x, i) {
    var left = items.slice(0, i);
    var right = items.slice(i + 1);
    var rest = left.concat(right);
    return !(isDuplicate(universe, right, x) || isChild(universe, rest, x));
  });
};

export default <any> {
  simplify: simplify
};