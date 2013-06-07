define(
  'ephox.polaris.api.Arrays',

  [
    'ephox.polaris.array.Slice',
    'ephox.polaris.array.Split'
  ],

  function (Slice, Split) {

    var splitBy = function (array, predicate) {
      return Split.splitBy(array, predicate);
    };

    var sliceBy = function (array, predicate) {
      return Slice.sliceBy(array, predicate);
    };

    return {
      splitBy: splitBy,
      sliceBy: sliceBy
    };

  }
);
