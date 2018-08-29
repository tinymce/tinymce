import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var eq = function <T,U> (universe: U & { eq: (v1: T, v2: T) => boolean }, item: T) {
  return Fun.curry(universe.eq, item);
};

var unsafeSubset = function (universe, common, ps1, ps2) {
  var children = universe.property().children(common);
  if (universe.eq(common, ps1[0])) return Option.some([ ps1[0] ]);
  if (universe.eq(common, ps2[0])) return Option.some([ ps2[0] ]);

  var finder = function (ps) {
    // ps is calculated bottom-up, but logically we're searching top-down
    var topDown = Arr.reverse(ps);

    // find the child of common in the ps array
    var index = Arr.findIndex(topDown, eq(universe, common)).getOr(-1);
    var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];

    // find the index of that child in the common children
    return Arr.findIndex(children, eq(universe, item));
  };

  var startIndex = finder(ps1);
  var endIndex = finder(ps2);

  // Return all common children between first and last
  return startIndex.bind(function (sIndex) {
    return endIndex.map(function (eIndex) {
      // This is required because the range could be backwards.
      var first = Math.min(sIndex, eIndex);
      var last = Math.max(sIndex, eIndex);

      return children.slice(first, last + 1);
    });
  });
};

// Note: this can be exported if it is required in the future.
var ancestors = function (universe, start, end, _isRoot?) {
  // Inefficient if no isRoot is supplied.
  var isRoot = _isRoot !== undefined ? _isRoot : Fun.constant(false);
  // TODO: Andy knows there is a graph-based algorithm to find a common parent, but can't remember it
  //        This also includes something to get the subset after finding the common parent
  var ps1 = [start].concat(universe.up().all(start));
  var ps2 = [end].concat(universe.up().all(end));

  var prune = function (path) {
    var index = Arr.findIndex(path, isRoot);
    return index.fold(function () {
      return path;
    }, function (ind) {
      return path.slice(0, ind + 1);
    });
  };

  var pruned1 = prune(ps1);
  var pruned2 = prune(ps2);

  var shared = Arr.find(pruned1, function (x) {
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
var subset = function (universe, start, end) {
  var ancs = ancestors(universe, start, end);
  return ancs.shared().bind(function (shared) {
    return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
  });
};

export default <any> {
  subset: subset,
  ancestors: ancestors
};