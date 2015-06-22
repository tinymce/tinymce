test(
  'FitmentIVTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.test.Fitment',
    'global!Array',
    'global!Math'
  ],

  function (Arr, Fun, Structs, Fitment, Array, Math) {
    var CYCLES = 100;
    var GRID_MIN = 1;  // 1x1 grid is the min
    var GRID_MAX = 5;

    var measureTest = Fitment.measureTest;
    var tailorIVTest = Fitment.tailorIVTest;
    var mcGirdlesTest = Fitment.mergeGridsIVTest;

    var generator = function () {
      var cell = function () {
        return '?';
      };

      var replace = function (name) {
        return name;
      };

      return {
        cell: cell,
        gap: Fun.constant('*'),
        row: Fun.constant('tr'),
        replace: replace
      };
    };

    var grid = function (rows, cols, _prefix) {
      var prefix = _prefix ? _prefix : '';
      return Arr.map(new Array(rows), function (row, r) {
        return Arr.map(new Array(cols), function (cols, c) {
          return prefix + '-' + r + '-' + c;
        });
      });
    };

    var rand = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var inVariantRunner = function (mvTest, times) {
      for (var i = 1, testSpec; i <= times; i++) {
        testSpec = mvTest();
        console.log('testing:', mvTest, i + ' / ' + times, ' params: ' + JSON.stringify(testSpec.params));
        testSpec.test();
      }
    };

    var gridGen = function (_prefix) {
      var cols = rand(GRID_MIN, GRID_MAX);
      var rows = rand(GRID_MIN, GRID_MAX);
      return {
        rows: Fun.constant(rows),
        cols: Fun.constant(cols),
        grid: Fun.constant(grid(rows, cols, _prefix))
      };
    };

    var startGen = function (gridSpec) {
      // because arrays start from 0 we -1
      var row = rand(0, gridSpec.rows()-1);
      var col = rand(0, gridSpec.cols()-1);
      return Structs.address(row, col);
    };

    var deltaGen = function () {
      var rowDelta = rand(-GRID_MAX, GRID_MAX);
      var colDelta = rand(-GRID_MAX, GRID_MAX);
      return {
        rowDelta: Fun.constant(rowDelta),
        colDelta: Fun.constant(colDelta)
      };

    };

    var measureIVTest = function () {
      var gridSpecA = gridGen();
      var gridSpecB = gridGen();
      var start = startGen(gridSpecA);

      var rowDelta = (gridSpecA.rows() - start.row()) - gridSpecB.rows();
      var colDelta = (gridSpecA.cols() - start.column()) - gridSpecB.cols();

      var info = {
        start: {
          row: start.row(),
          column: start.column()
        },
        gridA: {
          rows: gridSpecA.rows(),
          cols: gridSpecA.cols()
        },
        gridB: {
          rows: gridSpecB.rows(),
          cols: gridSpecB.cols()
        }
      };

      var test = Fun.curry(measureTest, {
        rowDelta: rowDelta,
        colDelta: colDelta
      }, start, gridSpecA.grid(), gridSpecB.grid(), Fun.noop );

      return {
        params: info,
        test: test
      };
    };

    var tailorTestIVTest = function () {
      var gridSpecA = gridGen();
      var start = startGen(gridSpecA);
      var delta = deltaGen();
      var expectedRows = delta.rowDelta() < 0 ? Math.abs(delta.rowDelta()) + gridSpecA.rows() : gridSpecA.rows();
      var expectedCols = delta.colDelta() < 0 ? Math.abs(delta.colDelta()) + gridSpecA.cols() : gridSpecA.cols();

      var info = {
        start: {
          row: start.row(),
          column: start.column()
        },
        gridA: {
          rows: gridSpecA.rows(),
          cols: gridSpecA.cols()
        },
        delta: {
          rowDelta: delta.rowDelta(),
          colDelta: delta.colDelta()
        },
        expected: {
          rows: expectedRows,
          cols: expectedCols
        }
      };

      var test = Fun.curry(tailorIVTest, {
        rows: expectedRows,
        cols: expectedCols
      }, start, gridSpecA.grid(), delta, generator);

      return {
        params: info,
        test: test
      };
    };

    var mergeGridsIVTest = function () {
      var gridSpecA = gridGen('a');
      var gridSpecB = gridGen('b');
      var start = startGen(gridSpecA);
      var info = {
        start: {
          row: start.row(),
          column: start.column()
        },
        gridA: {
          rows: gridSpecA.rows(),
          cols: gridSpecA.cols()
        },
        gridB: {
          rows: gridSpecB.rows(),
          cols: gridSpecB.cols()
        }
      };

      var queryliser2000 = function (result, start, gridSpecA, gridSpecB) {
        // expect to see some cell from specB at some address on specA
        var offsetRow = start.row();
        var offsetCol = start.column();

        Arr.each(gridSpecB.grid(), function (row, r) {
          Arr.each(row, function (col, c) {
            // roo = row
            // ar = r
            // res = result
            // offR = offsetRow
            // offC = offsetCol

            var expectedRow = r + offsetRow;
            var expectedCol = c + offsetCol;
            var expected = result[expectedRow][expectedCol];

            assert.eq(expected, col);

            // debugger
          });
        });
      };
      var test = Fun.curry(mcGirdlesTest, queryliser2000, start, gridSpecA, gridSpecB, generator);

      return {
        params: info,
        test: test
      };
    };

    inVariantRunner(mergeGridsIVTest, CYCLES);
    inVariantRunner(measureIVTest, CYCLES);
    inVariantRunner(tailorTestIVTest, CYCLES);

  }
);