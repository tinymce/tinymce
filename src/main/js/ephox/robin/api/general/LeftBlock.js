define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Hacksy'
  ],

  function (Arr, Option, Hacksy) {
    // FIX: Dupe, but Transform needs to change first

    /**
     * Gather elements left to the edge of the block item is in, ignoring children
     */

    var topStrategy = {
      rules: [
        { current: Hacksy.backtrack, next: Hacksy.sidestep, fallback: Option.none() },
        { current: Hacksy.sidestep, next: Hacksy.sidestep, fallback: Option.some(Hacksy.backtrack) },
        { current: Hacksy.advance, next: Hacksy.sidestep, fallback: Option.some(Hacksy.sidestep) }
      ],
      inclusion: function (universe, next, item) {
        // You can't just check the mode, because it may have fallen back to backtracking, 
        // even though mode was sidestep. Therefore, to see if a node is something that was
        // the parent of a previously traversed item, we have to do this. Very hacky... find a 
        // better way.
        var isParent = universe.property().parent(item).exists(function (p) {
          return universe.eq(p, next.item());
        });
        return !isParent;
      }
    };

    var allStrategy = {
      // rules === undefined, so use default.
      inclusion: function (universe, next, item) {
        return universe.property().isText(next.item());
      }
    };

    var goLeft = function (universe, item, mode, direction, strategy) {
      var next = Hacksy.go(universe, item, mode, Hacksy.left(), strategy.rules);
      return next.map(function (n) {
        var isBlock = universe.property().isEmptyTag(n.item()) || universe.property().isBoundary(n.item());
        if (isBlock) return [];
        var inclusions = strategy.inclusion(universe, n, item) ? [ n.item() ] : [];
        return inclusions.concat(goLeft(universe, n.item(), n.mode(), direction, strategy));
      }).getOr([]);
    };

    var top = function (universe, item) {
      var lefts = goLeft(universe, item, Hacksy.sidestep, Hacksy.left(), topStrategy);
      return Arr.reverse(lefts).concat([ item ]);
    };

    /**
     * Gather leaves left to the edge of the block item is in
     */
    var all = function (universe, item) {
      var lefts = goLeft(universe, item, Hacksy.sidestep, Hacksy.left(), allStrategy);
      return Arr.reverse(lefts).concat([ item ]);
    };

    return {
      top: top,
      all: all
    };
  }
);
