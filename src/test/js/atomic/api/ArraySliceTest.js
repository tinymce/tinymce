test(
  'api.Arrays.sliceBy',

  [
    'ephox.polaris.api.Arrays'
  ],

  function (Arrays) {
    var check = function (expected, input, pred) {
      var actual = Arrays.sliceBy(input, pred);
      assert.eq(expected, actual);
    };

    var is = function (value) {
      return function (x) {
        return x === value;
      };
    };

    check([ ], [ ], is(0));
    check([ ], [ 1 ], is(1));
    check([ 1 ], [ 1, 2 ], is(2));
    check([ 1, 2, 3 ], [1, 2, 3, 4 ], is(4));
  }
);
