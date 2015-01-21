define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.gather.Seeker'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Fun, Seeker) {
    var gather = function (universe, item, prune, transform) {
      return [];
    };

    var isLeaf = function (universe, element) {
      return universe.property().children(element).length === 0;
    };

    var before = function (universe, item, isRoot) {
      return Seeker.left(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    var after = function (universe, item, isRoot) {
      return Seeker.right(universe, item, Fun.curry(isLeaf, universe), isRoot);
    };

    return {
      gather: gather,
      before: before,
      after: after,
      seekLeft: Seeker.left,
      seekRight: Seeker.right
    };
  }
);
