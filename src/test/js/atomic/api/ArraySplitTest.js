test(
  'api.Arrays.splitby',

  [
    'ephox.peanut.Fun',
    'ephox.polaris.api.Arrays',
    'ephox.polaris.api.Splitting'
  ],

  function (Fun, Arrays, Splitting) {
    var check = function (expected, input, pred) {
      var actual = Arrays.splitby(input, pred);
      assert.eq(expected, actual);
    };

    check([], [], Fun.constant(true));
    check([[1]], [1], Fun.constant(false));
    check([[1, 2, 3]], [1, 2, 3], Fun.constant(false));
    check([[1], [2, 3], [4, 5, 6], [7], [8]], [1, '|', 2, 3, '|', 4, 5, 6, '|', 7, '|', '|', 8], function (x) {
      return x === '|';
    });

    var predicate = function (value) {
      if (value === 'x') return Splitting.excludeWithout(value);
      else if (value === '.') return Splitting.excludeWith(value);
      else return Splitting.include(value);
    };

    var checkAdv = function (expected, input) {
      var actual = Arrays.splitbyAdv(input, predicate);
      assert.eq(expected, actual);
    };

    checkAdv([ ], [ ]);
    checkAdv([
      [ '.' ],
      [ '.' ],
      [ 'a', 'b' ],
      [ 'd', 'e', 'f' ],
      [ '.' ],
      [ 'g' ]
    ], [ 'x', 'x', '.', 'x', '.', 'a', 'b', 'x', 'x', 'd', 'e', 'f', '.', 'g' ]);

  }
);
