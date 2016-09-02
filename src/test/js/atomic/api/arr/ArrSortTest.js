test(
  'ArrSortTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Jsc) {
    var testSanity = function () {
      assert.eq([1, 2, 3], Arr.sort([1, 3, 2]));
    };

    testSanity();

    Jsc.property(
      'sort(sort(xs)) === sort(xs)', Jsc.array(Jsc.nat), function (arr) {
        var sorted = Arr.sort(arr);
        var resorted = Arr.sort(sorted);
        return Jsc.eq(sorted, resorted);
      }
    );
  }
);