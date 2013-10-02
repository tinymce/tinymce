define(
  'ephox.robin.smartselect.Transform',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.gather.Transforms'
  ],

  function (Option, Spot, Transforms) {
    /**
     * Continue transform for word selection gathering, returns a list of (element, offset) text node pairs
     */
    return function (universe) {
      var transforms = Transforms(universe);

      return function (iter, elem, prune) {
        var f = function (x) {
          // The none given for the offset here is because the transformation function doesn't 
          // know which direction it is pruning. Pruning left should have an offset of 0, and 
          // pruning right should have an offset of text.length. They are defaulted later.
          return [Spot.point(x, Option.none())];
        };
        return transforms.traverse(iter, elem, prune, f);
      };
    };

  }
);
