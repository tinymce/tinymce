test(
  'ModificationOperationsTest',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Generators',
    'ephox.snooker.operate.ModificationOperations',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Fun, Option, Generators, ModificationOperations, TestGenerator) {
    // Test basic insert column
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModificationOperations.insertColumnAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity));
        assert.eq(expected, actual);
      };

      check([], [], 0, 0);
      check([[ '?_0' ]], [[ ]], 0, 0);
      check([[ '?_0', 'a' ]], [[ 'a' ]], 0, 0);
      check([[ 'a', '?_0' ]], [[ 'a' ]], 0, 1);
      check(
        [
          [ 'a', '?_0' ],
          [ 'b', '?_1' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 1
      );
      check(
        [
          [ '?_0', 'a' ],
          [ '?_1', 'b' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 0
      );
      // Spanning check.
      check(
        [
          [ 'a', 'a', 'a' ],
          [ 'b', '?_0', 'c' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'b', 'c' ]
        ], 0, 1
      );
      check(
        [
          [ 'a', 'b', '?_0' ],
          [ 'c', 'b', '?_0' ],
          [ 'c', 'd', '?_1' ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'b' ],
          [ 'c', 'd' ]
        ], 1, 2
      );

      // Copying the target row with a column
    })();

    // Test basic insert row
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModificationOperations.insertRowAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity));
        assert.eq(expected, actual);
      };

      check([[ '?_0' ], [ 'a' ]], [[ 'a' ]], 0, 0);
      check([[ 'a' ], [ '?_0' ]], [[ 'a' ]], 0, 1);
      check([[ 'a', 'b' ], [ '?_0', '?_1' ]], [[ 'a', 'b' ]], 0, 1);
      check([[ 'a', 'a' ], [ '?_0', '?_0' ]], [[ 'a', 'a' ]], 0, 1);

      check(
        [
          [ 'a', 'a', 'b' ],
          // *********** Should this really be ?_0 in the 2nd column? Shouldn't it be ?_1?
          [ '?_0', '?_0', 'b' ],
          [ 'c', 'd', 'b' ]
        ],
        [
          [ 'a', 'a', 'b' ],
          [ 'c', 'd', 'b' ]
        ], 0, 1);
    })();

    // Test basic delete column
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModificationOperations.deleteColumnAt(grid, index, Fun.tripleEquals);
        assert.eq(expected, actual);
      };

      check([[ ]], [[ 'a' ]], 0);
      check([[ 'b' ]], [[ 'a', 'b' ]], 0);
      check(
        [
          [ 'a', 'b' ], 
          [ 'c', 'c' ]
        ], 
        [
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);
    })();

    // Test basic delete row
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModificationOperations.deleteRowAt(grid, index, Fun.tripleEquals);
        assert.eq(expected, actual);
      };

      check([], [[ 'a' ]], 0);
      check([[ 'b' ]], [[ 'a' ], [ 'b' ]], 0);
      check(
        [
          [ 'a', 'b', 'b' ], 
          [ 'c', 'c', 'c' ]
        ], 
        [
          [ 'a', 'b', 'b' ],
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);
    })();

  }
);