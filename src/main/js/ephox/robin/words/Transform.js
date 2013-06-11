define(
  'ephox.robin.words.Transform',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.gather.Transforms',
    'ephox.sugar.api.Text'
  ],

  function (Spot, Transforms, Text) {
    return function (iter, elem, prune) {
      var f = function (x) {
        var spot = Spot.text(x, Text.get(x));
        return [spot];
      };
      return Transforms.traverse(iter, elem, prune, f);
    };
  }
);
