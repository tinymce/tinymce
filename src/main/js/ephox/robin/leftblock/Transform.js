define(
  'ephox.robin.leftblock.Transform',

  [
    'ephox.phoenix.api.data.GatherResult',
    'ephox.robin.gather.Transforms'
  ],

  function (GatherResult, Transforms) {
    return function (universe) {
      var ignoreChildren = function (iter, elem, prune) {
        return prune.stop(elem) ? GatherResult([], true) : GatherResult([elem], false);
      };

      var inspectChildren = function (iter, elem, prune) {
        var transforms = Transforms(universe);
        return transforms.traverse(iter, elem, prune, function (element) {
          return [ element ];
        });
      };

      return {
        ignoreChildren: ignoreChildren,
        inspectChildren: inspectChildren
      };
    };
  }
);
