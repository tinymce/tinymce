define(
  'ephox.polaris.array.Slice',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    /**
     * Slice an array at the first item matched by the predicate
     */
    var sliceby = function (list, pred) {
      var index = Arr.findIndex(list, pred);
      return list.slice(0, index);
    };

    return {
      sliceby: sliceby
    };

  }
);
