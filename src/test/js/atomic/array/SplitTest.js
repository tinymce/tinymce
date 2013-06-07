test(
  'ArraysTest',

  [
    'ephox.peanut.Fun',
    'ephox.polaris.array.Split'
  ],

  function (Fun, Split) {
    var check = function (expected, input, pred) {
      var actual = Split.splitBy(input, pred);
      assert.eq(expected, actual);
    };

    check([], [], Fun.constant(true));
    check([[1]], [1], Fun.constant(false));
    check([[1, 2, 3]], [1, 2, 3], Fun.constant(false));
    check([[1], [2, 3], [4, 5, 6], [7], [], [8]], [1, '|', 2, 3, '|', 4, 5, 6, '|', 7, '|', '|', 8], function (x) {
      return x === '|';
    });

  }
);
