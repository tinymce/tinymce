test(
  'FindIndexTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var check = function (expected, input, pred) {
      var actual = Arr.findIndex(input, pred);
      assert.eq(expected, actual);
    };

    check(-1, [], function (x) { return x > 0; });
    check(-1, [-1], function (x) { return x > 0; });
    check(0, [1], function (x) { return x > 0; });
    check(3, [4, 2, 10, 41, 3], function (x) { return x == 41; });
    check(5, [4, 2, 10, 41, 3, 100], function (x) { return x > 80; });
    check(-1, [4, 2, 10, 412, 3], function (x) { return x == 41; });
  }
);
