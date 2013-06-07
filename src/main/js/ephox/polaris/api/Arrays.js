define(
  'ephox.polaris.api.Arrays',

  [
    'ephox.polaris.array.Slice',
    'ephox.polaris.array.Split'
  ],

  function (Slice, Split) {

    var splitby = function (array, predicate) {
      return Split.splitby(array, predicate);
    };

    var sliceby = function (array, predicate) {
      return Slice.sliceby(array, predicate);
    };

    return {
      splitby: splitby,
      sliceby: sliceby
    };

  }
);
