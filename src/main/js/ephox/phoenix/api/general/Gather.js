define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.gather.Seeker',
    'ephox.phoenix.gather.Walker',
    'ephox.phoenix.gather.Walkers'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Fun, Seeker, Walker, Walkers) {
    var isLeaf = function (universe, element) {
      return universe.property().children(element).length === 0;
    };

    var before = function (universe, item, isRoot) {
      return seekLeft(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    var after = function (universe, item, isRoot) {
      return seekRight(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    var seekLeft = function (universe, item, predicate, isRoot) {
      return Seeker.left(universe, item, predicate, isRoot);
    };

    var seekRight = function (universe, item, predicate, isRoot) {
      return Seeker.right(universe, item, predicate, isRoot);
    };

    var walkers = function () {
      return {
        left: Walkers.left,
        right: Walkers.right
      };
    };

    var walk = function (universe, item, mode, direction, _rules) {
      return Walker.go(universe, item, mode, direction, _rules);
    };

    return {
      before: before,
      after: after,
      seekLeft: seekLeft,
      seekRight: seekRight,
      walkers: walkers,
      walk: walk,
      // These have to be direct references.
      backtrack: Walker.backtrack,
      sidestep: Walker.sidestep,
      advance: Walker.advance
    };
  }
);
