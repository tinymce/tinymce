import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Structs from 'ephox/snooker/api/Structs';
import Fitment from 'ephox/snooker/test/Fitment';
import TableMerge from 'ephox/snooker/test/TableMerge';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('FitmentIVTest', function() {
  // Note: cycles 500, min 1, max 200 ~ 22secs
  var CYCLES = 500;
  var GRID_MIN = 1;   // 1x1 grid is the min
  var GRID_MAX = 200;

  var measureTest = Fitment.measureTest;
  var tailorIVTest = Fitment.tailorIVTest;
  var mergeIVTest = TableMerge.mergeIVTest;

  var generator = function () {
    var counter = 0;

    var cell = function () {
      var r = '?_' + counter;
      counter++;
      return r;
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

  var grid = function (isNew, rows, cols, _prefix) {
    var prefix = _prefix ? _prefix : '';
    return Arr.map(new Array(rows), function (row, r) {
      return Arr.map(new Array(cols), function (cols, c) {
        return Structs.elementnew(prefix + '-' + r + '-' + c, isNew);
      });
    });
  };

  var rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var inVariantRunner = function (label, mvTest, times) {
    for (var i = 1, testSpec; i <= times; i++) {
      testSpec = mvTest();
      // console.log('testing:', label, i + ' / ' + times, ' params: ' + JSON.stringify(testSpec.params));
      testSpec.test();
    }
  };

  var gridGen = function (isNew, _prefix?) {
    var cols = rand(GRID_MIN, GRID_MAX);
    var rows = rand(GRID_MIN, GRID_MAX);
    return {
      rows: Fun.constant(rows),
      cols: Fun.constant(cols),
      grid: Fun.constant(grid(isNew, rows, cols, _prefix))
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
    var gridSpecA = gridGen(false);
    var gridSpecB = gridGen(true);
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
    }, start, gridSpecA.grid, gridSpecB.grid, Fun.noop );

    return {
      params: info,
      test: test
    };
  };

  var tailorTestIVTest = function () {
    var gridSpecA = gridGen(false);
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
    }, start, gridSpecA.grid, delta, generator);

    return {
      params: info,
      test: test
    };
  };

  var mergeGridsIVTest = function () {
    var gridSpecA = gridGen(false, 'a');
    var gridSpecB = gridGen(true, 'b');
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

      var gridA = gridSpecA.grid();
      var gridB = gridSpecB.grid();

      Arr.each(result, function (row, ri) {
        Arr.each(row, function (cell, ci) {
          var expected = (function () {
            // Assumption: both gridA and gridB are rectangular.
            if (ri >= offsetRow && ri <= offsetRow + gridB.length - 1 && ci >= offsetCol && ci <= offsetCol + gridB[0].length - 1) return gridB[ri - offsetRow][ci - offsetCol];
            else if (ri >= 0 && ri < gridA.length && ci >= 0 && ci < gridA[0].length) return gridA[ri][ci];
            else return '?';
          })();

          if (expected === '?') {
            assert.eq(true, '?_' === cell.substring(0,2));
          } else {
            assert.eq(expected, cell);
          }
        });
      });
    };

    var test = Fun.curry(mergeIVTest, queryliser2000, start, gridSpecA, gridSpecB, generator, Fun.tripleEquals);

    return {
      params: info,
      test: test
    };
  };

  console.log("running " + CYCLES + " measure tests...");
  inVariantRunner('measure', measureIVTest, CYCLES);
  console.log("running " + CYCLES + " tailor tests...");
  inVariantRunner('tailor', tailorTestIVTest, CYCLES);
  console.log("running " + CYCLES + " merge tests...");
  inVariantRunner('merge', mergeGridsIVTest, CYCLES);
  console.log("FitmentIVTest done.");
});

