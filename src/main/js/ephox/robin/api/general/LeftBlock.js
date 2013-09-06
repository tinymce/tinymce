define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.leftblock.Prune',
    'ephox.robin.leftblock.Transform'
  ],

  function (Gather, Prune, Transform) {
    // FIX: Dupe, but Transform needs to change first

    /** Gather elements left to the edge of the block item is in, ignoring children */
    var top = function (universe, item) {
      var transform = Transform(universe);
      var prune = Prune(universe);
      var gathered = Gather.gather(universe, item, prune, transform.ignoreChildren);
      return gathered.left().concat([item]);
    };

    /** Gather leaves left to the edge of the block item is in */
    var all = function (universe, item) {
      var transform = Transform(universe);
      var prune = Prune(universe);
      var gathered = Gather.gather(universe, item, prune, transform.inspectChildren);
      return gathered.left().concat([item]);
    };

    return {
      top: top,
      all: all
    };
  }
);
