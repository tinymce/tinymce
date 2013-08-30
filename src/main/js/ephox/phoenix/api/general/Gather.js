define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.Neighbour'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Gather, Neighbour) {
    var gather = function (universe, item, prune, transform) {
      return Gather.gather(universe, item, prune, transform);
    };

    var before = function (universe, item, isRoot) {
      return Neighbour.before(universe, item, isRoot);
    };

    var after = function (universe, item, isRoot) {
      return Neighbour.after(universe, item, isRoot);
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
