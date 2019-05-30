import { assert, UnitTest } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Structs from 'ephox/snooker/api/Structs';
import Fitment from 'ephox/snooker/test/Fitment';
import TableMerge from 'ephox/snooker/test/TableMerge';

UnitTest.test('FitmentIVTest', function () {
  const browser = PlatformDetection.detect().browser;

  // Note: cycles 500, min 1, max 200 ~ 22secs (on nodejs, anyway)
  const CYCLES = browser.isIE() || browser.isEdge() || browser.isFirefox() ? 1 : 100;
  const GRID_MIN = 1;   // 1x1 grid is the min
  const GRID_MAX = 200;

  const measureTest = Fitment.measureTest;
  const tailorIVTest = Fitment.tailorIVTest;
  const mergeIVTest = TableMerge.mergeIVTest;

  const generator = function () {
    let counter = 0;

    const cell = function () {
      const r = '?_' + counter;
      counter++;
      return r;
    };

    const replace = function (name) {
      return name;
    };

    return {
      cell,
      gap: Fun.constant('*'),
      row: Fun.constant('tr'),
      replace
    };
  };

  const grid = function (isNew, rows, cols, _prefix) {
    const prefix = _prefix ? _prefix : '';
    return Arr.map(new Array(rows), function (row, r) {
      return Arr.map(new Array(cols), function (cs, c) {
        return Structs.elementnew(prefix + '-' + r + '-' + c, isNew);
      });
    });
  };

  const rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const inVariantRunner = function (label, mvTest, times) {
    for (let i = 1; i <= times; i++) {
      const testSpec = mvTest();
      // console.log('testing:', label, i + ' / ' + times, ' params: ' + JSON.stringify(testSpec.params));
      testSpec.test();
    }
  };

  const gridGen = function (isNew, _prefix?) {
    const cols = rand(GRID_MIN, GRID_MAX);
    const rows = rand(GRID_MIN, GRID_MAX);
    return {
      rows: Fun.constant(rows),
      cols: Fun.constant(cols),
      grid: Fun.constant(grid(isNew, rows, cols, _prefix))
    };
  };

  const startGen = function (gridSpec) {
    // because arrays start from 0 we -1
    const row = rand(0, gridSpec.rows() - 1);
    const col = rand(0, gridSpec.cols() - 1);
    return Structs.address(row, col);
  };

  const deltaGen = function () {
    const rowDelta = rand(-GRID_MAX, GRID_MAX);
    const colDelta = rand(-GRID_MAX, GRID_MAX);
    return {
      rowDelta: Fun.constant(rowDelta),
      colDelta: Fun.constant(colDelta)
    };
  };

  const measureIVTest = function () {
    const gridSpecA = gridGen(false);
    const gridSpecB = gridGen(true);
    const start = startGen(gridSpecA);

    const rowDelta = (gridSpecA.rows() - start.row()) - gridSpecB.rows();
    const colDelta = (gridSpecA.cols() - start.column()) - gridSpecB.cols();

    const info = {
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

    const test = Fun.curry(measureTest, {
      rowDelta,
      colDelta
    }, start, gridSpecA.grid, gridSpecB.grid, Fun.noop );

    return {
      params: info,
      test
    };
  };

  const tailorTestIVTest = function () {
    const gridSpecA = gridGen(false);
    const start = startGen(gridSpecA);
    const delta = deltaGen();
    const expectedRows = delta.rowDelta() < 0 ? Math.abs(delta.rowDelta()) + gridSpecA.rows() : gridSpecA.rows();
    const expectedCols = delta.colDelta() < 0 ? Math.abs(delta.colDelta()) + gridSpecA.cols() : gridSpecA.cols();

    const info = {
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

    const test = Fun.curry(tailorIVTest, {
      rows: expectedRows,
      cols: expectedCols
    }, start, gridSpecA.grid, delta, generator);

    return {
      params: info,
      test
    };
  };

  const mergeGridsIVTest = function () {
    const gridSpecA = gridGen(false, 'a');
    const gridSpecB = gridGen(true, 'b');
    const start = startGen(gridSpecA);
    const info = {
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

    const queryliser2000 = function (result, s, specA, specB) {
      // expect to see some cell from specB at some address on specA
      const offsetRow = s.row();
      const offsetCol = s.column();

      const gridA = specA.grid();
      const gridB = specB.grid();

      Arr.each(result, function (row, ri) {
        Arr.each(row, function (cell, ci) {
          const expected = (function () {
            // Assumption: both gridA and gridB are rectangular.
            if (ri >= offsetRow && ri <= offsetRow + gridB.length - 1 && ci >= offsetCol && ci <= offsetCol + gridB[0].length - 1) { return gridB[ri - offsetRow][ci - offsetCol]; } else if (ri >= 0 && ri < gridA.length && ci >= 0 && ci < gridA[0].length) { return gridA[ri][ci]; } else { return '?'; }
          })();

          if (expected === '?') {
            assert.eq(true, '?_' === cell.substring(0, 2));
          } else {
            assert.eq(expected, cell);
          }
        });
      });
    };

    const test = Fun.curry(mergeIVTest, queryliser2000, start, gridSpecA, gridSpecB, generator, Fun.tripleEquals);

    return {
      params: info,
      test
    };
  };

  /* tslint:disable:no-console */
  console.log('running ' + CYCLES + ' measure tests...');
  inVariantRunner('measure', measureIVTest, CYCLES);
  console.log('running ' + CYCLES + ' tailor tests...');
  inVariantRunner('tailor', tailorTestIVTest, CYCLES);
  console.log('running ' + CYCLES + ' merge tests...');
  inVariantRunner('merge', mergeGridsIVTest, CYCLES);
  console.log('FitmentIVTest done.');
});
