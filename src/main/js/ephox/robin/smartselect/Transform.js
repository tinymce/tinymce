define(
  'ephox.robin.smartselect.Transform',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.gather.Transforms'
  ],

  function (Option, Spot, Transforms) {
    /**
     * Continue transform for word selection gathering, returning.
     */
    return function (universe) {
      var transforms = Transforms(universe);

      return function (iter, elem, prune) {
        var f = function (x) {
          return [Spot.point(x, Option.none())];
        };
        return transforms.traverse(iter, elem, prune, f);
      };
    };

  }
);
