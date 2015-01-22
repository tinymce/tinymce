define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.gather.Walker',
    'ephox.phoenix.gather.Walking',
    'ephox.robin.leftblock.Walks'
  ],

  function (Arr, Walker, Walking, Walks) {
    var goLeft = function (universe, item, mode, direction, strategy) {
      var next = Walker.go(universe, item, mode, Walking.left(), strategy.rules);
      return next.map(function (n) {
        var isBlock = universe.property().isEmptyTag(n.item()) || universe.property().isBoundary(n.item());
        if (isBlock) return [];
        var inclusions = strategy.inclusion(universe, n, item) ? [ n.item() ] : [];
        return inclusions.concat(goLeft(universe, n.item(), n.mode(), direction, strategy));
      }).getOr([]);
    };

    var top = function (universe, item) {
      var lefts = goLeft(universe, item, Walker.sidestep, Walking.left(), Walks.top);
      return Arr.reverse(lefts).concat([ item ]);
    };

    /**
     * Gather leaves left to the edge of the block item is in
     */
    var all = function (universe, item) {
      var lefts = goLeft(universe, item, Walker.sidestep, Walking.left(), Walks.all);
      return Arr.reverse(lefts).concat([ item ]);
    };

    return {
      top: top,
      all: all
    };
  }
);
