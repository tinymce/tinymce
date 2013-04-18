define(
  'ephox.robin.leftblock.Transform',

  [
    'ephox.phoenix.gather.GatherResult',
    'ephox.robin.gather.Transforms'
  ],

  function (GatherResult, Transforms) {
    var ignoreChildren = function (iter, elem, prune) {
      return prune.stop(elem) ? GatherResult([], true) : GatherResult([elem], false);
    };

    var inspectChildren = function (iter, elem, prune) {
      return Transforms.traverse(iter, elem, prune, function (element) {
        return [ element ];
      });
    };

    return {
      ignoreChildren: ignoreChildren,
      inspectChildren: inspectChildren
    };
  }
);
