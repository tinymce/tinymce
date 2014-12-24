define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Gather'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Option, Gather) {
    var gather = function (universe, item, prune, transform) {
      return Gather.gather(universe, item, prune, transform);
    };

    var before = function (universe, item, isRoot) {
      return Option.none();
      // return Neighbour.before(universe, item, isRoot);
    };

    var after = function (universe, item, isRoot) {
      return Option.none();
      // return Neighbour.after(universe, item, isRoot);
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
