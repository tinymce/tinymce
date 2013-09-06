define(
  'ephox.robin.words.Transform',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.gather.Transforms'
  ],

  function (Spot, Transforms) {
    /**
     * Continue transform for word cluster gathering, returns all text.
     */
    return function (universe) {
      var transforms = Transforms(universe);

      return function (iter, elem, prune) {
        var f = function (x) {
          var spot = Spot.text(x, universe.property().getText(x));
          return [spot];
        };
        return transforms.traverse(iter, elem, prune, f);
      };
    };
  }
);
