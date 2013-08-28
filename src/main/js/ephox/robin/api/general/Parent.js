define(
  'ephox.robin.api.general.Parent',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Identify',
    'ephox.robin.parent.Breaker',
    'ephox.robin.parent.Shared',
    'ephox.robin.parent.Subset'
  ],

  function (Fun, Option, Identify, Breaker, Shared, Subset) {
    var sharedBlock = function (universe, elements) {
      var look = function(universe, element) {
        var domIsBlock = Fun.curry(Identify.isBlock, universe);
        return domIsBlock(element) ?
            Option.some(element) :
            universe.up().predicate(element, domIsBlock);
      };
      return Shared.oneAll(universe, look, elements);
    };

    var sharedOne = function (universe, look, elements) {
      return Shared.oneAll(universe, look, elements);
    };

    var subset = function (universe, start, finish) {
      return Subset.subset(universe, start, finish);
    };

    var breakAt = function (universe, parent, child) {
      return Breaker.breakAt(universe, parent, child);
    };

    return {
      sharedOne: sharedOne,
      sharedBlock: sharedBlock,
      subset: subset,
      breakAt: breakAt
    };
  }
);
