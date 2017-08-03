test(
  'MergeOperationsTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Arr, Fun, Structs, MergingOperations) {
    var b = Structs.bounds;
    var r = Structs.rowcells;

    // Test basic merge.
    (function () {
      var check = function (expected, grid, bounds, lead) {
        var actual = MergingOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead));
        assert.eq(expected.length, actual.length);
        Arr.each(expected, function (row, i) {
          assert.eq(row.cells(), actual[i].cells());
          assert.eq(row.section(), actual[i].section());
        });
      };

      check([], [], b(0, 0, 1, 1), 'a');
      check([r([ 'a', 'a' ], 'tbody')], [r([ 'a', 'b' ], 'tbody')], b(0, 0, 0, 1), 'a');
      check(
        [
          r([ 'a', 'a' ], 'tbody'),
          r([ 'a', 'a' ], 'tbody')
        ],
        [
          r([ 'a', 'b' ], 'tbody'),
          r([ 'c', 'd' ], 'tbody')
        ], b(0, 0, 1, 1), 'a'
      );

      check(
        [
          r([ 'a', 'a', 'c' ], 'tbody'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'tbody'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], b(0, 0, 0, 1), 'a'
      );

      check(
        [
          r([ 'a', 'a', 'a' ], 'tbody'),
          r([ 'a', 'a', 'a' ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'tbody'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], b(0, 0, 1, 2), 'a'
      );
    })();

    // Test basic unmerge.
    (function () {
      var check = function (expected, grid, target) {
        var actual = MergingOperations.unmerge(grid, target, Fun.tripleEquals, Fun.constant('?'));
        assert.eq(expected.length, actual.length);
        Arr.each(expected, function (row, i) {
          assert.eq(row.cells(), actual[i].cells());
          assert.eq(row.section(), actual[i].section());
        });
      };

      check([], [], 'a');
      check([r([ 'a', '?' ], 'tbody')], [r([ 'a', 'a' ], 'tbody')], 'a');
      check(
        [
          r([ 'a', '?' ], 'tbody'),
          r([ '?', '?' ], 'tbody')
        ],
        [
          r([ 'a', 'a' ], 'tbody'),
          r([ 'a', 'a' ], 'tbody')
        ], 'a'
      );

      check(
        [
          r([ 'a', 'b', '?', 'c' ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'b', 'c' ], 'tbody')
        ], 'b'
      );

      check(
        [
          r([ 'a', 'b', '?', 'c' ], 'tbody'),
          r([ 'a', '?', '?', 'd' ], 'tbody'),
          r([ 'f', '?', '?', 'e' ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'b', 'c' ], 'tbody'),
          r([ 'a', 'b', 'b', 'd' ], 'tbody'),
          r([ 'f', 'b', 'b', 'e' ], 'tbody')
        ], 'b'
      );

      check(
        [
          r([ 'a', 'b', 'b', 'c' ], 'tbody'),
          r([ '?', 'b', 'b', 'd' ], 'tbody'),
          r([ 'f', 'b', 'b', 'e' ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'b', 'c' ], 'tbody'),
          r([ 'a', 'b', 'b', 'd' ], 'tbody'),
          r([ 'f', 'b', 'b', 'e' ], 'tbody')
        ], 'a'
      );
    })();
  }
);