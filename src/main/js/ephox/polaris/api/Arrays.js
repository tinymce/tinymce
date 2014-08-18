define(
  'ephox.polaris.api.Arrays',

  [
    'ephox.polaris.array.Boundaries',
    'ephox.polaris.array.Slice',
    'ephox.polaris.array.Split'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Boundaries, Slice, Split) {
    var boundAt = function (xs, left, right, comparator) {
      return Boundaries.boundAt(xs, left, right, comparator);
    };

    var splitby = function (array, predicate) {
      return Split.splitby(array, predicate);
    };

    var sliceby = function (array, predicate) {
      return Slice.sliceby(array, predicate);
    };

    return {
      splitby: splitby,
      sliceby: sliceby,
      boundAt: boundAt
    };

  }
);
