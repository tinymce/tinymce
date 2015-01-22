define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.leftblock.Walks'
  ],

  function (Arr, Fun, Gather, Walks) {
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

    var run = function (strategy, universe, item) {
      var lefts = goLeft(universe, item, Gather.sidestep, strategy);
      return Arr.reverse(lefts).concat([ item ]);
    };

    return {
      top: Fun.curry(run, Walks.top),
      all: Fun.curry(run, Walks.all)
    };
  }
);
