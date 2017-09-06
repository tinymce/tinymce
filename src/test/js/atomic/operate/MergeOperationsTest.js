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
    var en = Structs.elementnew;

    // Test basic merge.
    (function () {
      var check = function (expected, grid, bounds, lead) {
        var actual = MergingOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead));
        assert.eq(expected.length, actual.length);
        Arr.each(expected, function (row, i) {
          Arr.each(row.cells(), function (cell, j) {
            assert.eq(cell.element(), actual[i].cells()[j].element());
            assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
          });
          assert.eq(row.section(), actual[i].section());
        });
      };

      check([], [], b(0, 0, 1, 1), 'a');
      check([r([ en('a', false), en('a', false) ], 'thead')], [r([ 'a', 'b' ], 'thead')], b(0, 0, 0, 1), 'a');
      check([r([ en('a', false), en('a', false) ], 'tbody')], [r([ 'a', 'b' ], 'tbody')], b(0, 0, 0, 1), 'a');
      check(
        [
          r([ en('a', false), en('a', false) ], 'thead'),
          r([ en('a', false), en('a', false) ], 'thead')
        ],
        [
          r([ 'a', 'b' ], 'thead'),
          r([ 'c', 'd' ], 'thead')
        ], b(0, 0, 1, 1), 'a'
      );
      check(
        [
          r([ en('a', false), en('a', false) ], 'tbody'),
          r([ en('a', false), en('a', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b' ], 'tbody'),
          r([ 'c', 'd' ], 'tbody')
        ], b(0, 0, 1, 1), 'a'
      );

      check(
        [
          r([ en('a', false), en('a', false), en('c', false) ], 'thead'),
          r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'thead'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], b(0, 0, 0, 1), 'a'
      );
      check(
        [
          r([ en('a', false), en('a', false), en('c', false) ], 'tbody'),
          r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'tbody'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], b(0, 0, 0, 1), 'a'
      );

      check(
        [
          r([ en('a', false), en('a', false), en('a', false) ], 'tbody'),
          r([ en('a', false), en('a', false), en('a', false) ], 'tbody')
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
          Arr.each(row, function (cell, j) {
            assert.eq(cell.element(), actual[i].cells()[j].element());
            assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
          });
          assert.eq(row.section(), actual[i].section());
        });
      };

      check([], [], 'a');
      check([r([ 'a', '?' ], 'thead')], [r([ 'a', 'a' ], 'thead')], 'a');
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
          r([ 'a', 'b', '?', 'c' ], 'thead')
        ],
        [
          r([ 'a', 'b', 'b', 'c' ], 'thead')
        ], 'b'
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