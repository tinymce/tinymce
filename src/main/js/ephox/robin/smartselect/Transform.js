define(
  'ephox.robin.smartselect.Transform',

  [
    'ephox.robin.gather.Transforms'
  ],

  function (Transforms) {
    /**
     * Continue transform for word selection gathering, returning.
     */
    return function (universe) {
      var transforms = Transforms(universe);

      return function (iter, elem, prune) {
        var f = function (x) {
          return [];
        };
        return transforms.traverse(iter, elem, prune, f);
      };
    };

  }
);
