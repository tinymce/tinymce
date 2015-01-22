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
      return Seeker.left(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    var after = function (universe, item, isRoot) {
      return Seeker.right(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    var seekLeft = function (universe, item, predicate, isRoot) {
      return hone(universe, item, predicate, Walker.sidestep, Walkers.left(), isRoot);
    };

    var seekRight = function (universe, item, predicate, isRoot) {
      return hone(universe, item, predicate, Walker.sidestep, Walkers.right(), isRoot);
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

    var backtrack = function (universe, item, direction, _transition) {
      return Walker.backtrack(universe, item, direction, _transition);
    };

    var sidestep = function (universe, item, direction, _transition) {
      return Walker.sidestep(universe, item, direction, _transition);
    };

    var advance = function (universe, item, direction, _transition) {
      return Walker.advance(universe, item, direction, _transition);
    };

    return {
      before: before,
      after: after,
      seekLeft: seekLeft,
      seekRight: seekRight,
      walkers: walkers,
      walk: walk,
      backtrack: backtrack,
      sidestep: sidestep,
      advance: advance
    };
  }
);
