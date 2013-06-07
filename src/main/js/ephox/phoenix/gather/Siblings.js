define(
  'ephox.phoenix.gather.Siblings',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    var left = function (universe, element) {
      var siblings = siblingsAndSelf(universe, element);
      var current = Arr.findIndex(siblings, function (x) {
        return universe.eq(x, element);
      });
      
      return siblings.slice(0, current);
    };

    var right = function (universe, element) {
      var siblings = siblingsAndSelf(universe, element);
      var current = Arr.findIndex(siblings, function (x) {
        return universe.eq(x, element);
      });

      return current > -1 ? siblings.slice(current + 1) : [];
    };

    var siblingsAndSelf = function (universe, element) {
      var parent = universe.property().parent(element);
      return parent.fold(Fun.constant([]), function (v) {
        return universe.property().children(v);
      });
    };

    return {
      left: left,
      right: right
    };

  }
);
