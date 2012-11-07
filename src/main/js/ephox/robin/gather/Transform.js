define(
  'ephox.robin.gather.Transform',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.gather.GatherResult',
    'ephox.robin.gather.Transforms',
    'ephox.sugar.api.Text'
  ],

  function (Spot, GatherResult, Transforms, Text) {

    var basic = function (iter, elem, prune) {
      var f = function (x) {
        return [x];
      };
      return Transforms.traverse(iter, elem, prune, f);
    };

    var ignoreChildren = function (iter, elem, prune) {
      return prune.stop(elem) ? GatherResult([], true) : GatherResult([elem], false);
    };

    var word = function (iter, elem, prune) {
      var f = function (x) {
        var spot = Spot.text(x, Text.get(x));
        return [spot];
      };
      return Transforms.traverse(iter, elem, prune, f);
    };
    
    return {
      basic: basic,
      ignoreChildren: ignoreChildren,
      word: word
    };
  }
);
