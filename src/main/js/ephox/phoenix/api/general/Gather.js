define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.phoenix.gather.LeafGather'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (LeafGather) {
    var gather = function (universe, item, prune, transform) {
      return [];
      // return Gather.gather(universe, item, prune, transform);
    };

    var isLeaf = function (universe, element) {
      return universe.property().children(element).length === 0;
    };

    var before = function (universe, item, isRoot) {
      return LeafGather.before(universe, item, function (elem) {
        return isLeaf(universe, elem);
      });
    };

    var after = function (universe, item, isRoot) {
      return LeafGather.after(universe, item, function (elem) {
        return isLeaf(universe, elem);
      });
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
