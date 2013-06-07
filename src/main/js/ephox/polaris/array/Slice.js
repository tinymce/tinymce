define(
  'ephox.polaris.array.Slice',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var sliceBy = function (list, pred) {
      var index = Arr.findIndex(list, pred);
      return list.slice(0, index);
    };

    return {
      sliceBy: sliceBy
    };

  }
);
