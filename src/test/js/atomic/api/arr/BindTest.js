test(
  'BindTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var len = function (x) {
      return [x.length];
    };

    var check = function (expected, input, f) {
      assert.eq(expected, Arr.bind(input, f));
    };

    check([], [], len);
    check([1], [[1]], len);
    check([1, 1], [[1], [2]], len);
    check([2, 0, 1, 2, 0], [[1, 2], [], [3], [4, 5], []], len);
  }
);
