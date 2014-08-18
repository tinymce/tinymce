define(
  'ephox.polaris.array.Boundaries',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    var boundAt = function (xs, left, right, comparator) {
      var leftIndex = Arr.findIndex(xs, Fun.curry(comparator, left));
      var first = leftIndex > -1 ?  leftIndex : 0;
      var rightIndex = Arr.findIndex(xs, Fun.curry(comparator, right));
      var last = rightIndex > -1  ? rightIndex + 1 : xs.length;
      return xs.slice(first, last);
    };

    return {
      boundAt: boundAt
    };
  }
);