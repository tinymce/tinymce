define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.leftblock.Walks'
  ],

  function (Arr, Gather, Walks) {
    var walkers = Gather.walkers();

    var goLeft = function (universe, item, mode, strategy) {
      var next = Gather.walk(universe, item, mode, walkers.left(), strategy.rules);
      return next.map(function (n) {
        var isBlock = universe.property().isEmptyTag(n.item()) || universe.property().isBoundary(n.item());
        if (isBlock) return [];
        var inclusions = strategy.inclusion(universe, n, item) ? [ n.item() ] : [];
        return inclusions.concat(goLeft(universe, n.item(), n.mode(), strategy));
      }).getOr([]);
    };

    var top = function (universe, item) {
      var lefts = goLeft(universe, item, Gather.sidestep, Walks.top);
      return Arr.reverse(lefts).concat([ item ]);
    };

    /**
     * Gather leaves left to the edge of the block item is in
     */
    var all = function (universe, item) {
      var lefts = goLeft(universe, item, Gather.sidestep, Walks.all);
      return Arr.reverse(lefts).concat([ item ]);
    };

    return {
      top: top,
      all: all
    };
  }
);
