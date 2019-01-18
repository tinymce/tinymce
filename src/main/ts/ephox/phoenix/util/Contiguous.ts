import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

// Start a new list so push the current group into the groups list (if not empty) and reset current to have just item
var nextlist = function (rest, parent, item) {
  return {
    groups: rest.current.length > 0 ? rest.groups.concat({ parent: rest.parent, children: rest.current }) : rest.groups,
    current: [ item ],
    parent: parent
  };
};

// Accumulating item into current list; groups is unaffected.
var accumulate = function (rest, parent, item) {
  return {
    groups: rest.groups,
    current: rest.current.concat([ item ]),
    parent: parent
  };
};

var inspect = function (universe, rest, item) {
  // Conditions:
  // 1. There is nothing in the current list ... start a current list with item (nextlist)
  // 2. The item is the right sibling of the last thing on the current list ... accumulate into current list. (accumulate)
  // 3. Otherwise ... close off current, and start a new current with item (nextlist)
  var nextSibling = Option.from(rest.current[rest.current.length - 1]).bind(universe.query().nextSibling);
  return nextSibling.bind(function (next) {
    var same = universe.eq(next, item);
    return same ? Option.some(accumulate) : Option.none();
  }).getOr(nextlist);
};

var textnodes = function (universe, items) {
  var init = { groups: [], current: [], parent: null };

  var result = Arr.foldl(items, function (rest, item) {
    return universe.property().parent(item).fold(function () {
      // Items without parents don't affect the result.
      return rest;
    }, function (parent) {
      var builder = inspect(universe, rest, item);
      return builder(rest, parent, item);
    });
  }, init);

  return result.current.length > 0 ? result.groups.concat({ parent: result.parent, children: result.current }) : result.groups;
};

export default {
  textnodes: textnodes
};