define(
  'ephox.robin.api.general.Parent',

  [
    'ephox.robin.parent.Breaker',
    'ephox.robin.parent.Shared',
    'ephox.robin.parent.Subset'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Breaker, Shared, Subset) {
    var sharedOne = function (universe, look, elements) {
      return Shared.oneAll(universe, look, elements);
    };

    var subset = function (universe, start, finish) {
      return Subset.subset(universe, start, finish);
    };

    var breakAt = function (universe, parent, child) {
      return Breaker.breakAt(universe, parent, child);
    };

    var breakAtLeft = function (universe, parent, child) {
      return Breaker.breakAtLeft(universe, parent, child);
    };

    var breakPath = function (universe, child, isTop, breaker) {
      return Breaker.breakPath(universe, child, isTop, breaker);
    };

    return {
      sharedOne: sharedOne,
      subset: subset,
      breakAt: breakAt,
      breakAtLeft: breakAtLeft,
      breakPath: breakPath
    };
  }
);
