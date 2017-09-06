test(
  'ModificationOperationsTest',

  {
    'ephox.syrup.api.Css': '../mock/ephox/syrup/api/Css',
    'ephox.syrup.api.Attr': '../mock/ephox/syrup/api/Attr'
  },

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Generators',
    'ephox.snooker.api.Structs',
    'ephox.snooker.operate.ModificationOperations',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Arr, Fun, Generators, Structs, ModificationOperations, TestGenerator) {
    var r = Structs.rowcells;
    var en = Structs.elementnew;
    var mapToStructGrid = function (grid) {
      return Arr.map(grid, function (row) {
        return Structs.rowcells(row, 'tbody');
      });
    };

    var assertGrids = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        Arr.each(row.cells(), function (cell, j) {
          assert.eq(cell.element(), actual[i].cells()[j].element());
          assert.eq(cell.isNew(), actual[i].cells()[j].isNew());
        });
        assert.eq(row.section(), actual[i].section());
      });
    };

    // Test basic insert column
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModificationOperations.insertColumnAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(expected, actual);
      };
      var checkBody = function (expected, grid, example, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, example, index);
      };

      checkBody([], [], 0, 0);
      checkBody([[ en('?_0', true) ]], [[ ]], 0, 0);
      checkBody([[ en('?_0', true), en('a', false) ]], [[ 'a' ]], 0, 0);
      checkBody([[ en('a', false), en('?_0', true) ]], [[ 'a' ]], 0, 1);
      checkBody(
        [
          [ en('a', false), en('?_0', true) ],
          [ en('b', false), en('?_1', true) ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('?_0', true), en('a', false) ],
          [ en('?_1', true), en('b', false) ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 0
      );
      // Spanning check.
      checkBody(
        [
          [ en('a', false), en('a', true), en('a', false) ],
          [ en('b', false), en('?_0', true), en('c', false) ]
        ],
        [
          [ 'a', 'a' ],
          [ 'b', 'c' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('?_0', true) ],
          [ en('c', false), en('b', false), en('?_0', true) ],
          [ en('c', false), en('d', false), en('?_1', true) ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'b' ],
          [ 'c', 'd' ]
        ], 1, 2
      );

      check(
        [
          r([ en('a', false), en('?_0', true) ], 'thead'),
          r([ en('b', false), en('?_1', true) ], 'tbody')
        ],
        [
          r([ 'a' ], 'thead'),
          r([ 'b' ], 'tbody')
        ], 0, 1
      );

      check(
        [
          r([ en('?_0', true), en('a', false) ], 'thead'),
          r([ en('?_1', true), en('b', false) ], 'tbody')
        ],
        [
          r([ 'a' ], 'thead'),
          r([ 'b' ], 'tbody')
        ], 0, 0
      );

      check(
        [
          r([ en('a', false), en('a', true), en('a', false) ], 'thead'),
          r([ en('b', false), en('?_0', true), en('c', false) ], 'tbody')
        ],
        [
          r([ 'a', 'a' ], 'thead'),
          r([ 'b', 'c' ], 'tbody')
        ], 0, 1
      );
    })();

    // Test basic insert row
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModificationOperations.insertRowAt(grid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(expected, actual);
      };

      var checkBody = function (expected, grid, example, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, example, index);
      };

      checkBody([[ en('?_0', true) ], [ en('a', false) ]], [[ 'a' ]], 0, 0);
      checkBody([[ en('a', false) ], [ en('?_0', true) ]], [[ 'a' ]], 0, 1);
      checkBody([[ en('a', false), en('b', false) ], [ en('?_0', true), en('?_1', true) ]], [[ 'a', 'b' ]], 0, 1);
      checkBody([[ en('a', false), en('a', false) ], [ en('?_0', true), en('?_0', true) ]], [[ 'a', 'a' ]], 0, 1);

      checkBody(
        [
          [ en('a', false), en('a', false), en('b', false) ],
          [ en('?_0', true), en('?_0', true), en('b', false) ],
          [ en('c', false), en('d', false), en('b', false) ]
        ],
        [
          [ 'a', 'a', 'b' ],
          [ 'c', 'd', 'b' ]
        ], 0, 1);

        check(
        [
          r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
          r([ en('?_0', true), en('?_1', true), en('?_2', true) ], 'thead'),
          r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'thead'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], 0, 1);

        check(
        [
          r([ en('a', false), en('b', false), en('c', false) ], 'thead'),
          r([ en('?_0', true), en('?_1', true), en('?_2', true) ], 'tbody'),
          r([ en('d', false), en('e', false), en('f', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c' ], 'thead'),
          r([ 'd', 'e', 'f' ], 'tbody')
        ], 1, 1);
    })();

    // Test basic delete column
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModificationOperations.deleteColumnsAt(grid, index, index);
        assertGrids(expected, actual);
      };

      var checkBody = function (expected, grid, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, index);
      };

      checkBody([], [[ 'a' ]], 0);
      checkBody([[ en('b', false) ]], [[ 'a', 'b' ]], 0);
      checkBody(
        [
          [ en('a', false), en('b', false) ],
          [ en('c', false), en('c', false) ]
        ],
        [
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);
      check(
        [
          r([ en('a', false), en('b', false) ], 'thead'),
          r([ en('c', false), en('c', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'b' ], 'thead'),
          r([ 'c', 'c', 'c' ], 'tbody')
        ], 1);
    })();

    // Test basic delete row
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModificationOperations.deleteRowsAt(grid, index, index);
        assertGrids(expected, actual);
      };

      var checkBody = function (expected, grid, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, index);
      };

      checkBody([], [[ 'a' ]], 0);
      checkBody([[ en('b', false) ]], [[ 'a' ], [ 'b' ]], 0);
      checkBody(
        [
          [ en('a', false), en('b', false), en('b', false) ],
          [ en('c', false), en('c', false), en('c', false) ]
        ],
        [
          [ 'a', 'b', 'b' ],
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);

      check(
        [
          r([ en('a', false), en('b', false), en('b', false) ], 'thead'),
          r([ en('c', false), en('c', false), en('c', false) ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'b' ], 'thead'),
          r([ 'a', 'b', 'b' ], 'tbody'),
          r([ 'c', 'c', 'c' ], 'tbody')
        ], 1);
    })();

    (function () {
      var check = function (expected, grid, exRow, exCol) {
        var actual = ModificationOperations.splitCellIntoColumns(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(expected, actual);
      };

      var checkBody = function (expected, grid, exRow, exCol) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, exRow, exCol);
      };

      // splitting simple tables without existing colspans
      checkBody([], [], 0, 0); // ?? table without rows
      checkBody([[ en('?_0', true) ]], [[ ]], 0, 0);
      checkBody([[ en('a', false), en('?_0', true) ]], [[ 'a' ]], 0, 0);
      checkBody([[ en('a', false), en('?_0', true), en('b', false) ]], [[ 'a', 'b' ]], 0, 0);
      checkBody([[ en('a', false), en('b', false), en('?_0', true) ]], [[ 'a', 'b' ]], 0, 1);
      checkBody(
        [
          [ en('a', false), en('b', false), en('?_0', true) ],
          [ en('c', false), en('d', false), en('d', true)   ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('a', false), en('?_0', true), en('b', false), en('c', false)],
          [ en('d', false), en('d', true),   en('e', false), en('f', false)],
          [ en('g', false), en('g', true),   en('h', false), en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 0
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('b', true),   en('c', false)],
          [ en('d', false), en('e', false), en('?_0', true), en('f', false)],
          [ en('g', false), en('h', false), en('h', true),   en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 1, 1
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false), en('c', true)  ],
          [ en('d', false), en('e', false), en('f', false), en('f', true)  ],
          [ en('g', false), en('h', false), en('i', false), en('?_0', true)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false), en('?_0', true)],
          [ en('d', false), en('e', false), en('f', false), en('f', true)  ],
          [ en('g', false), en('h', false), en('i', false), en('i', true)  ]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 2
      );
      checkBody(
        [
          [ en('a', false), en('a', true),   en('b', false), en('c', false)],
          [ en('d', false), en('d', true),   en('e', false), en('f', false)],
          [ en('g', false), en('?_0', true), en('h', false), en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // Splitting a cell where other cells have colspans
        checkBody(
        [
          [ en('a', false), en('b', false), en('?_0', true) ],
          [ en('c', false), en('c', false), en('c', true)   ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'c' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('a', false), en('?_0', true), en('b', false), en('c', false)],
          [ en('d', false), en('d', true),   en('d', false), en('f', false)],
          [ en('g', false), en('g', true),   en('h', false), en('h', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'd', 'f'],
          [ 'g', 'h', 'h']
        ], 0, 0
      );
      checkBody(
        [
          [ en('a', false), en('a', false), en('a', true),   en('a', false)],
          [ en('d', false), en('e', false), en('?_0', true), en('f', false)],
          [ en('g', false), en('h', false), en('h', true),   en('h', false)]
        ],
        [
          [ 'a', 'a', 'a'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'h']
        ], 1, 1
      );
      checkBody(
        [
          [ en('a', false), en('a', false), en('c', false), en('c', true)  ],
          [ en('d', false), en('d', false), en('d', false), en('d', true)  ],
          [ en('g', false), en('h', false), en('i', false), en('?_0', true)]
        ],
        [
          [ 'a', 'a', 'c'],
          [ 'd', 'd', 'd'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false), en('?_0', true)],
          [ en('d', false), en('e', false), en('e', false), en('e', true)  ],
          [ en('g', false), en('g', false), en('i', false), en('i', true)  ]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'e'],
          [ 'g', 'g', 'i']
        ], 0, 2
      );
      checkBody(
        [
          [ en('a', false), en('a', true),   en('a', false), en('c', false)],
          [ en('a', false), en('a', true),   en('a', false), en('a', false)],
          [ en('g', false), en('?_0', true), en('h', false), en('i', false)]
        ],
        [
          [ 'a', 'a', 'c'],
          [ 'a', 'a', 'a'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // splitting a cell which is already merged
      checkBody(
        [
          [ en('a', false), en('a', false),   en('a', true), en('a', false)],
          [ en('a', false), en('a', false),   en('?_0', true), en('a', false)],
          [ en('a', false), en('a', false),   en('a', true), en('a', false)]
        ],
        [
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a']
        ], 1, 1
      );
      check(
        [
          r([ en('a', false), en('b', false), en('c', false), en('?_0', true)], 'thead'),
          r([ en('d', false), en('e', false), en('e', false), en('e', true)  ], 'tbody'),
          r([ en('g', false), en('g', false), en('i', false), en('i', true)  ], 'tbody')
        ],
        [
          r([ 'a', 'b', 'c'], 'thead'),
          r([ 'd', 'e', 'e'], 'tbody'),
          r([ 'g', 'g', 'i'], 'tbody')
        ], 0, 2
      );

      check(
        [
          r([ en('a', false), en('a', true),   en('a', false), en('c', false)], 'thead'),
          r([ en('a', false), en('a', true),   en('a', false), en('a', false)], 'tbody'),
          r([ en('g', false), en('?_0', true), en('h', false), en('i', false)], 'tbody')
        ],
        [
          r([ 'a', 'a', 'c'], 'thead'),
          r([ 'a', 'a', 'a'], 'tbody'),
          r([ 'g', 'h', 'i'], 'tbody')
        ], 2, 0
      );
    })();


    (function () {
      var check = function (expected, grid, exRow, exCol) {
        var actual = ModificationOperations.splitCellIntoRows(grid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(expected, actual);
      };

      var checkBody = function (expected, grid, exRow, exCol) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        check(structExpected, structGrid, exRow, exCol);
      };

      // splitting simple tables without existing rowspans
      // checkBody([], [], 0, 0); // ?? table without rows will fail - a problem?
      // checkBody([[]], [], 0, 0); // This case shouldn't come up?
      checkBody([[], []], [[ ]], 0, 0);
      checkBody([[ en('a', false)], [en('?_0', true) ]], [[ 'a' ]], 0, 0);
      checkBody([[ en('a', false), en('b', false) ], [ en('?_0', true), en('b', false) ]], [[ 'a', 'b' ]], 0, 0);
      checkBody([[ en('a', false), en('b', false) ], [ en('a', false), en('?_0', true) ]], [[ 'a', 'b' ]], 0, 1);
      checkBody(
        [
          [ en('a', false), en('b', false)   ],
          [ en('a', false), en('?_0', true) ],
          [ en('c', false), en('d', false)   ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('a', false),   en('b', false), en('c', false)],
          [ en('?_0', true), en('b', false), en('c', false)],
          [ en('d', false),   en('e', false), en('f', false)],
          [ en('g', false),   en('h', false), en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 0
      );
      checkBody(
        [
          [ en('a', false), en('b', false),   en('c', false)],
          [ en('d', false), en('e', false),   en('f', false)],
          [ en('d', false), en('?_0', true), en('f', false)],
          [ en('g', false), en('h', false),   en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 1, 1
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false)  ],
          [ en('d', false), en('e', false), en('f', false)  ],
          [ en('g', false), en('h', false), en('i', false)  ],
          [ en('g', false), en('h', false), en('?_0', true)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false)   ],
          [ en('a', false), en('b', false), en('?_0', true) ],
          [ en('d', false), en('e', false), en('f', false)   ],
          [ en('g', false), en('h', false), en('i', false)   ]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 2
      );
      checkBody(
        [
          [ en('a', false),   en('b', false), en('c', false)],
          [ en('d', false),   en('e', false), en('f', false)],
          [ en('g', false),   en('h', false), en('i', false)],
          [ en('?_0', true), en('h', false), en('i', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // Splitting a cell where other cells have rowspans
      checkBody(
        [
          [ en('a', false), en('b', false)   ],
          [ en('a', false), en('?_0', true) ],
          [ en('a', false), en('c', false)   ]
        ],
        [
          [ 'a', 'b' ],
          [ 'a', 'c' ]
        ], 0, 1
      );
      checkBody(
        [
          [ en('a', false),   en('b', false), en('c', false)],
          [ en('?_0', true), en('b', false), en('c', false)],
          [ en('d', false),   en('b', false), en('f', false)],
          [ en('g', false),   en('h', false), en('f', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'b', 'f'],
          [ 'g', 'h', 'f']
        ], 0, 0
      );
      checkBody(
        [
          [ en('a', false), en('b', false),   en('c', false)],
          [ en('a', false), en('e', false),   en('c', false)],
          [ en('a', false), en('?_0', true), en('c', false)],
          [ en('a', false), en('e', false),   en('f', false)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'e', 'c'],
          [ 'a', 'e', 'f']
        ], 1, 1
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false)  ],
          [ en('a', false), en('b', false), en('i', false)  ],
          [ en('a', false), en('h', false), en('i', false)  ],
          [ en('a', false), en('h', false), en('?_0', true)]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'b', 'i'],
          [ 'a', 'h', 'i']
        ], 2, 2
      );
      checkBody(
        [
          [ en('a', false), en('b', false), en('c', false)  ],
          [ en('a', false), en('b', false), en('?_0', true)],
          [ en('a', false), en('e', false), en('e', false)  ],
          [ en('d', false), en('e', false), en('i', false)  ]
        ],
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'e', 'e'],
          [ 'd', 'e', 'i']
        ], 0, 2
      );
      checkBody(
        [
          [ en('a', false),   en('a', false), en('b', false)],
          [ en('a', false),   en('a', false), en('a', false)],
          [ en('c', false),   en('a', false), en('i', false)],
          [ en('?_0', true), en('a', false), en('i', false)]
        ],
        [
          [ 'a', 'a', 'b'],
          [ 'a', 'a', 'a'],
          [ 'c', 'a', 'i']
        ], 2, 0
      );
      // splitting a cell which is already merged
      checkBody(
        [
          [ en('a', false), en('a', false),   en('a', false)],
          [ en('a', false), en('a', false),   en('a', false)],
          [ en('a', false), en('?_0', true), en('a', false)],
          [ en('a', false), en('a', false),   en('a', false)]
        ],
        [
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a']
        ], 1, 1
      );

      check(
        [
          r([ en('a', false), en('b', false)   ], 'thead'),
          r([ en('a', false), en('?_0', true) ], 'thead'),
          r([ en('c', false), en('d', false)   ], 'tbody')
        ],
        [
          r([ 'a', 'b' ], 'thead'),
          r([ 'c', 'd' ], 'tbody')
        ], 0, 1
      );
    })();
  }
);