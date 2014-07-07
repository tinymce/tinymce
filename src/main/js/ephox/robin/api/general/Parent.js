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

    var breakPath = function (universe, child, isTop, breaker) {
      return Breaker.breakPath(universe, child, isTop, breaker);
    };

    var ancestors = function (universe, start, finish, isRoot) {
      return Subset.ancestors(universe, start, finish, isRoot);
    };

    return {
      sharedOne: sharedOne,
      subset: subset,
      breakAt: breakAt,
      breakPath: breakPath,
      ancestors: ancestors
    };
  }
);
