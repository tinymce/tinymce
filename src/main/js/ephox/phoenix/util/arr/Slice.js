define(
  'ephox.phoenix.util.arr.Slice',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {

    var slice = function (list, pred) {
      var index = Arr.findIndex(list, pred);
      return list.slice(0, index);
    };

    return {
      slice: slice
    };

  }
);
