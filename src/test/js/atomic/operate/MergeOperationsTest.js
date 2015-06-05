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
        ], nu.bounds(0, 0, 1, 1), 'a');
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
    })();
  }
);