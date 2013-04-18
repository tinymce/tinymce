define(
  'ephox.robin.pathway.Simplify',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Compare, Traverse) {
    var eq = function (e1) {
      return Fun.curry(Compare.eq, e1);
    };

    var isDuplicate = function (rest, element) {
      return Arr.exists(rest, eq(element));
    };

    var isChild = function (rest, element) {
      var parents = Traverse.parents(element);
      return Arr.exists(parents, function (p) {
        return isDuplicate(rest, p);
      });
    };

    // FIX: Horribly inefficient.
    var simplify = function (elements) {
      return Arr.filter(elements, function (x, i) {
        var rest = elements.slice(0, i).concat(elements.slice(i+1));
        return !(isDuplicate(rest, x) || isChild(rest, x));
      });
    };

    return {
      simplify: simplify
    };
  }
);
