define(
  'ephox.robin.leftblock.Transform',

  [
    'ephox.phoenix.api.data.GatherResult',
    'ephox.robin.gather.Transforms'
  ],

  function (GatherResult, Transforms) {
    return function (universe) {

      /**
       * Gather transform that doesn't consider children, just collects the top-level elements.
       */
      var ignoreChildren = function (iter, elem, prune) {
        // INVESTIGATE: Does prune.stop() always return false? This shouldn't be called unless it is false.
        return prune.stop(elem) ? GatherResult([], true) : GatherResult([elem], false);
      };

      /**
       * Gather transform that collects all leaf nodes.
       */
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
