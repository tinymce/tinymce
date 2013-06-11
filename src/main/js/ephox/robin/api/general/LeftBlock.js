define(
  'ephox.robin.api.general.LeftBlock',

  [
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.leftblock.Prune',
    'ephox.robin.leftblock.Transform'
  ],

  function (Gather, Prune, Transform) {
    // FIX: Dupe, but it helps with readability (from experience)
    var top = function (universe, item) {
      var transform = Transform(universe);
      var prune = Prune(universe);
      var gathered = Gather.gather(universe, item, prune, transform.ignoreChildren);
      return gathered.left().concat([item]);
    };

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
