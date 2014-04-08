define(
  'ephox.robin.parent.Subset',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Arr, Fun, Option, Math) {
    var eq = function (universe, item) {
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
        var index = Arr.findIndex(topDown, eq(universe, common));
        var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];

        // find the index of that child in the common children
        return Arr.findIndex(children, eq(universe, item));
      };

      var startIndex = finder(ps1);
      var endIndex = finder(ps2);

      // This is required because the range could be backwards.
      var first = Math.min(startIndex, endIndex);
      var last = Math.max(startIndex, endIndex);

      // Return all common children between first and last
      return startIndex > -1 && endIndex > -1 ? Option.some(children.slice(first, last + 1)) : Option.none();
    };

    /**
     * Find the common element in the parents of start and end.
     *
     * Then return all children of the common element such that start and end are included.
     */
    var subset = function (universe, start, end) {
      // TODO: Andy knows there is a graph-based algorithm to find a common parent, but can't remember it
      //        This also includes something to get the subset after finding the common parent
      var ps1 = [start].concat(universe.up().all(start));
      var ps2 = [end].concat(universe.up().all(end));
      var common = Arr.find(ps1, function (x) {
        return Arr.exists(ps2, eq(universe, x));
      });

      return common !== undefined ? unsafeSubset(universe, common, ps1, ps2) : Option.none();
    };

    return {
      subset: subset
    };
  }
);
