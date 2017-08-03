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
    var mapToStructGrid = function (grid) {
      return Arr.map(grid, function (row) {
        return Structs.rowcells(row, 'tbody');
      });
    };

    var assertGrids = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        assert.eq(row.cells(), actual[i].cells());
        assert.eq(row.section(), actual[i].section());
      });
    };

    // Test basic insert column
    (function () {
      var check = function (expected, grid, example, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.insertColumnAt(structGrid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(structExpected, actual);
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
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.insertRowAt(structGrid, index, example, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(structExpected, actual);
      };

      check([[ '?_0' ], [ 'a' ]], [[ 'a' ]], 0, 0);
      check([[ 'a' ], [ '?_0' ]], [[ 'a' ]], 0, 1);
      check([[ 'a', 'b' ], [ '?_0', '?_1' ]], [[ 'a', 'b' ]], 0, 1);
      check([[ 'a', 'a' ], [ '?_0', '?_0' ]], [[ 'a', 'a' ]], 0, 1);

      check(
        [
          [ 'a', 'a', 'b' ],
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
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.deleteColumnsAt(structGrid, index, index);
        assertGrids(structExpected, actual);
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
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.deleteRowsAt(structGrid, index, index);
        assertGrids(structExpected, actual);
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

    (function () {
      var check = function (expected, grid, exRow, exCol) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.splitCellIntoColumns(structGrid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(structExpected, actual);
      };
      
      // splitting simple tables without existing colspans 
      check([], [], 0, 0); // ?? table without rows
      check([[ '?_0' ]], [[ ]], 0, 0);
      check([[ 'a', '?_0' ]], [[ 'a' ]], 0, 0);
      check([[ 'a', '?_0', 'b' ]], [[ 'a', 'b' ]], 0, 0);
      check([[ 'a', 'b', '?_0' ]], [[ 'a', 'b' ]], 0, 1);
      check(
        [
          [ 'a', 'b', '?_0' ],
          [ 'c', 'd', 'd'   ]
        ], 
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], 0, 1
      );
      check(
        [
          [ 'a', '?_0', 'b', 'c'],
          [ 'd', 'd',   'e', 'f'],
          [ 'g', 'g',   'h', 'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 0
      );
      check(
        [
          [ 'a', 'b', 'b',   'c'],
          [ 'd', 'e', '?_0', 'f'],
          [ 'g', 'h', 'h',   'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 1, 1
      );
      check(
        [
          [ 'a', 'b', 'c', 'c'  ],
          [ 'd', 'e', 'f', 'f'  ],
          [ 'g', 'h', 'i', '?_0']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      check(
        [
          [ 'a', 'b', 'c', '?_0'],
          [ 'd', 'e', 'f', 'f'  ],
          [ 'g', 'h', 'i', 'i'  ]
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 2
      );
      check(
        [
          [ 'a', 'a',   'b', 'c'],
          [ 'd', 'd',   'e', 'f'],
          [ 'g', '?_0', 'h', 'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // Splitting a cell where other cells have colspans
        check(
        [
          [ 'a', 'b', '?_0' ],
          [ 'c', 'c', 'c'   ]
        ], 
        [
          [ 'a', 'b' ],
          [ 'c', 'c' ]
        ], 0, 1
      );
      check(
        [
          [ 'a', '?_0', 'b', 'c'],
          [ 'd', 'd',   'd', 'f'],
          [ 'g', 'g',   'h', 'h']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'd', 'f'],
          [ 'g', 'h', 'h']
        ], 0, 0
      );
      check(
        [
          [ 'a', 'a', 'a',   'a'],
          [ 'd', 'e', '?_0', 'f'],
          [ 'g', 'h', 'h',   'h']
        ], 
        [
          [ 'a', 'a', 'a'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'h']
        ], 1, 1
      );
      check(
        [
          [ 'a', 'a', 'c', 'c'  ],
          [ 'd', 'd', 'd', 'd'  ],
          [ 'g', 'h', 'i', '?_0']
        ], 
        [
          [ 'a', 'a', 'c'],
          [ 'd', 'd', 'd'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      check(
        [
          [ 'a', 'b', 'c', '?_0'],
          [ 'd', 'e', 'e', 'e'  ],
          [ 'g', 'g', 'i', 'i'  ]
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'e'],
          [ 'g', 'g', 'i']
        ], 0, 2
      );
      check(
        [
          [ 'a', 'a',   'a', 'c'],
          [ 'a', 'a',   'a', 'a'],
          [ 'g', '?_0', 'h', 'i']
        ], 
        [
          [ 'a', 'a', 'c'],
          [ 'a', 'a', 'a'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // splitting a cell which is already merged
      check(
        [
          [ 'a', 'a',   'a', 'a'],
          [ 'a', 'a',   '?_0', 'a'],
          [ 'a', 'a',   'a', 'a']
        ], 
        [
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a']
        ], 1, 1
      );
    })();


    (function () {
      var check = function (expected, grid, exRow, exCol) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = ModificationOperations.splitCellIntoRows(structGrid, exRow, exCol, Fun.tripleEquals, Generators.modification(TestGenerator(), Fun.identity).getOrInit);
        assertGrids(structExpected, actual);
      };
      
      // splitting simple tables without existing rowspans 
      // check([], [], 0, 0); // ?? table without rows will fail - a problem?
      // check([[]], [], 0, 0); // This case shouldn't come up?
      check([[], []], [[ ]], 0, 0); 
      check([[ 'a'], ['?_0' ]], [[ 'a' ]], 0, 0);
      check([[ 'a', 'b' ], [ '?_0', 'b' ]], [[ 'a', 'b' ]], 0, 0);
      check([[ 'a', 'b' ], [ 'a', '?_0' ]], [[ 'a', 'b' ]], 0, 1);
      check(
        [
          [ 'a', 'b'   ],
          [ 'a', '?_0' ],
          [ 'c', 'd'   ]
        ], 
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], 0, 1
      );
      check(
        [
          [ 'a',   'b', 'c'],
          [ '?_0', 'b', 'c'],
          [ 'd',   'e', 'f'],
          [ 'g',   'h', 'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 0
      );
      check(
        [
          [ 'a', 'b',   'c'],
          [ 'd', 'e',   'f'],
          [ 'd', '?_0', 'f'],
          [ 'g', 'h',   'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 1, 1
      );
      check(
        [
          [ 'a', 'b', 'c'  ],
          [ 'd', 'e', 'f'  ],
          [ 'g', 'h', 'i'  ],
          [ 'g', 'h', '?_0']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 2
      );
      check(
        [
          [ 'a', 'b', 'c'   ],
          [ 'a', 'b', '?_0' ],
          [ 'd', 'e', 'f'   ],
          [ 'g', 'h', 'i'   ]
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 0, 2
      );
      check(
        [
          [ 'a',   'b', 'c'],
          [ 'd',   'e', 'f'],
          [ 'g',   'h', 'i'],
          [ '?_0', 'h', 'i']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'e', 'f'],
          [ 'g', 'h', 'i']
        ], 2, 0
      );
      // Splitting a cell where other cells have rowspans
      check(
        [
          [ 'a', 'b'   ],
          [ 'a', '?_0' ],
          [ 'a', 'c'   ]
        ], 
        [
          [ 'a', 'b' ],
          [ 'a', 'c' ]
        ], 0, 1
      );
      check(
        [
          [ 'a',   'b', 'c'],
          [ '?_0', 'b', 'c'],
          [ 'd',   'b', 'f'],
          [ 'g',   'h', 'f']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'd', 'b', 'f'],
          [ 'g', 'h', 'f']
        ], 0, 0
      );
      check(
        [
          [ 'a', 'b',   'c'],
          [ 'a', 'e',   'c'],
          [ 'a', '?_0', 'c'],
          [ 'a', 'e',   'f']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'e', 'c'],
          [ 'a', 'e', 'f']
        ], 1, 1
      );
      check(
        [
          [ 'a', 'b', 'c'  ],
          [ 'a', 'b', 'i'  ],
          [ 'a', 'h', 'i'  ],
          [ 'a', 'h', '?_0']
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'b', 'i'],
          [ 'a', 'h', 'i']
        ], 2, 2
      );
      check(
        [
          [ 'a', 'b', 'c'  ],
          [ 'a', 'b', '?_0'],
          [ 'a', 'e', 'e'  ],
          [ 'd', 'e', 'i'  ]
        ], 
        [
          [ 'a', 'b', 'c'],
          [ 'a', 'e', 'e'],
          [ 'd', 'e', 'i']
        ], 0, 2
      );
      check(
        [
          [ 'a',   'a', 'b'],
          [ 'a',   'a', 'a'],
          [ 'c',   'a', 'i'],
          [ '?_0', 'a', 'i']
        ], 
        [
          [ 'a', 'a', 'b'],
          [ 'a', 'a', 'a'],
          [ 'c', 'a', 'i']
        ], 2, 0
      );
      // splitting a cell which is already merged
      check(
        [
          [ 'a', 'a',   'a'],
          [ 'a', 'a',   'a'],
          [ 'a', '?_0', 'a'],
          [ 'a', 'a',   'a']
        ], 
        [
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a'],
          [ 'a', 'a', 'a']
        ], 1, 1
      );
    })();
  }
);