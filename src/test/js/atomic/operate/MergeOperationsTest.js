test(
  'MergeOperationsTest',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Fun, Struct, MergingOperations) {
    var nu = {
      bounds: Struct.immutable('startRow', 'startCol', 'finishRow', 'finishCol')
    };


    // Test basic merge.
    (function () {
      var check = function (expected, grid, bounds, lead) {
        var actual = MergingOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead));
        assert.eq(expected, actual);
      };

      check([], [], nu.bounds(0, 0, 1, 1), 'a');
      check([[ 'a', 'a' ]], [[ 'a', 'b' ]], nu.bounds(0, 0, 0, 1), 'a');
      check(
        [
          [ 'a', 'a' ],
          [ 'a', 'a' ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], nu.bounds(0, 0, 1, 1), 'a'
      );

      check(
        [
          [ 'a', 'a', 'c' ],
          [ 'd', 'e', 'f' ]
        ],
        [
          [ 'a', 'b', 'c' ],
           [ 'd', 'e', 'f']
        ], nu.bounds(0, 0, 0, 1), 'a'
      );

      check(
        [
          [ 'a', 'a', 'a' ],
          [ 'a', 'a', 'a' ]
        ],
        [
          [ 'a', 'b', 'c' ],
          [ 'd', 'e', 'f']
        ], nu.bounds(0, 0, 1, 2), 'a'
      );
    })();

    // Test basic unmerge.
    (function () {
      var check = function (expected, grid, target) {
        var actual = MergingOperations.unmerge(grid, target, Fun.tripleEquals, Fun.constant('?'));
        assert.eq(expected, actual);
      };

      check([], [], 'a');
      check([[ 'a', '?' ]], [[ 'a', 'a' ]], 'a');
      check(
        [
          [ 'a', '?' ],
          [ '?', '?' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'a', 'a' ]
        ], 'a'
      );

      check(
        [
          [ 'a', 'b', '?', 'c' ]
        ],
        [
          [ 'a', 'b', 'b', 'c']
        ], 'b'
      );

      check(
        [
          [ 'a', 'b', '?', 'c' ],
          [ 'a', '?', '?', 'd' ],
          [ 'f', '?', '?', 'e' ]
        ],
        [
          [ 'a', 'b', 'b', 'c' ],
          [ 'a', 'b', 'b', 'd' ],
          [ 'f', 'b', 'b', 'e' ]
        ], 'b'
      );

      check(
        [
          [ 'a', 'b', 'b', 'c' ],
          [ '?', 'b', 'b', 'd' ],
          [ 'f', 'b', 'b', 'e' ]
        ],
        [
          [ 'a', 'b', 'b', 'c' ],
          [ 'a', 'b', 'b', 'd' ],
          [ 'f', 'b', 'b', 'e' ]
        ], 'a'
      );
    })();
  }
);