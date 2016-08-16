test(
  'DifferenceTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var check = function (expected, a1, a2) {
      assert.eq(expected, Arr.difference(a1, a2));
    };

    check([], [], []);
    check([1], [1], []);
    check([1, 2, 3], [1, 2, 3], []);
    check([], [], [1, 2, 3]);
    check([], [1, 2, 3], [1, 2, 3]);
    check([1, 3], [1, 2, 3, 4], [2, 4]);
    check([1], [1, 2, 3], [3, 2]);
    check([2], [1, 2, 3, 4], [3, 4, 5, 1, 10, 10000, 56]);
  }
);
