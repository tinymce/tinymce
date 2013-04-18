define(
  'ephox.robin.api.LeftBlock',

  [
    'ephox.phoenix.gather.Gather',
    'ephox.robin.leftblock.Prune',
    'ephox.robin.leftblock.Transform'
  ],

  function (Gather, Prune, Transform) {
    // FIX: Dupe, but it helps with readability (from experience)
    var top = function (element) {
      var gathered = Gather.gather(element, Prune, Transform.ignoreChildren);
      return gathered.left().concat([element]);
    };

    var all = function (element) {
      var gathered = Gather.gather(element, Prune, Transform.inspectChildren);
      return gathered.left().concat([element]);
    };

    return {
      top: top,
      all: all
    };
  }
);
