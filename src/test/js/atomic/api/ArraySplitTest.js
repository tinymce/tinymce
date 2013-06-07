test(
  'api.Arrays.splitBy',

  [
    'ephox.peanut.Fun',
    'ephox.polaris.api.Arrays'
  ],

  function (Fun, Arrays) {
    var check = function (expected, input, pred) {
      var actual = Arrays.splitBy(input, pred);
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
