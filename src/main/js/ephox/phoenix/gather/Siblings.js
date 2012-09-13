define(
  'ephox.phoenix.gather.Siblings',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Compare, Traverse) {
    var left = function (element) {
      var siblings = siblingsAndSelf(element);
      var current = Arr.findIndex(siblings, function (x) {
        return Compare.eq(x, element);
      });
      
      return siblings.slice(0, current);
    };

    var right = function (element) {
      var siblings = siblingsAndSelf(element);
      var current = Arr.findIndex(siblings, function (x) {
        return Compare.eq(x, element);
      });

      return current > -1 ? siblings.slice(current + 1) : [];
    };

    var siblingsAndSelf = function (element) {
      var parent = Traverse.parent(element);
      return parent.fold(Fun.constant([]), function (v) {
        return Traverse.children(v);
      });
    };

    return {
      left: left,
      right: right
    };

  }
);
