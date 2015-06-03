test(
  'ModelOperationsTest',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.snooker.model.ModelOperations'
  ],

  function (Fun, Struct, ModelOperations) {
    var nu = {
      lead: Struct.immutable('cell', 'rowspan', 'colspan'),
      bounds: Struct.immutable('startRow', 'startCol', 'finishRow', 'finishCol')
    };

    // Test basic merge.
    (function () {
      var check = function (expected, grid, bounds, lead) {
        var actual = ModelOperations.merge(grid, bounds, lead, Fun.tripleEquals);
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
        var actual = ModelOperations.unmerge(grid, target, Fun.tripleEquals, Fun.constant('?'));
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

    // Test basic insert column
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModelOperations.insertColumnAt(grid, index, Fun.tripleEquals, Fun.constant('?'));
        assert.eq(expected, actual);
      };

      check([], [], 0);
      check([[ '?' ]], [[ ]], 0);
      check([[ '?', 'a' ]], [[ 'a' ]], 0);
      check([[ 'a', '?' ]], [[ 'a' ]], 1);
      check(
        [
          [ 'a', '?' ],
          [ 'b', '?' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 1
      );
      check(
        [
          [ '?', 'a' ],
          [ '?', 'b' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0
      );
      // Spanning check.
      check(
        [
          [ 'a', 'a', 'a' ],
          [ 'b', '?', 'c' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'b', 'c' ]
        ], 1
      );
      check(
        [
          [ 'a', 'a', '?' ],
          [ 'b', 'c', '?' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'b', 'c' ]
        ], 2
      );
    })();

    // Test basic insert row
    (function () {

    })();

    // Test basic delete column
    (function () {

    })();

    // Test basic delete row
    (function () {

    })();
  }
);