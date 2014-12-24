define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.phoenix.gather.LeafGather',
    'ephox.sugar.api.Traverse'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (LeafGather, Traverse) {
    var gather = function (universe, item, prune, transform) {
      return [];
      // return Gather.gather(universe, item, prune, transform);
    };

    var isLeaf = function (element) {
      return Traverse.chlidren(element).length === 0;
    };

    var before = function (universe, item, isRoot) {
      return LeafGather.before(universe, item, isLeaf);
    };

    var after = function (universe, item, isRoot) {
      return LeafGather.after(universe, item, isLeaf);
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
