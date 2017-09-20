define(
  'ephox.polaris.array.Boundaries',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (Arr, Fun) {
    var boundAt = function (xs, left, right, comparator) {
      var leftIndex = Arr.findIndex(xs, Fun.curry(comparator, left));
      var first = leftIndex.getOr(0);
      var rightIndex = Arr.findIndex(xs, Fun.curry(comparator, right));
      var last = rightIndex.map(function (rIndex) {
        return rIndex + 1;
      }).getOr(xs.length);
      return xs.slice(first, last);
    };

    return {
      boundAt: boundAt
    };
  }
);