import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { SimpleGenerators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as Fitment from 'ephox/snooker/test/Fitment';
import * as TableMerge from 'ephox/snooker/test/TableMerge';

interface InvTest {
  readonly test: () => void;
}

interface Spec {
  readonly rows: number;
  readonly cols: number;
  readonly grid: Structs.ElementNew[][];
}

UnitTest.test('FitmentIVTest', () => {
  const en = (fakeElement: any, isNew: boolean) =>
    Structs.elementnew(fakeElement as SugarElement<any>, isNew, false);

  // Spend 5 seconds running as many iterations as we can (there are three cycles, so 15s total)
  const CYCLE_TIME = 5000;
  const GRID_MIN = 1;   // 1x1 grid is the min
  const GRID_MAX = 200;

  const measureTest = Fitment.measureTest;
  const tailorIVTest = Fitment.tailorIVTest;
  const mergeIVTest = TableMerge.mergeIVTest;

  const generator = (): SimpleGenerators => {
    let counter = 0;

    const cell = () => {
      const r = '?_' + counter;
      counter++;
      return r;
    };

    return {
      cell,
      gap: Fun.constant('*'),
      row: Fun.constant('tr'),
      replace: Fun.identity
    } as any;
  };

  const grid = (isNew: boolean, rows: number, cols: number, prefix: string = '') =>
    Arr.map(new Array(rows), (_row, r) => Arr.map(new Array(cols), (_cs, c) =>
      en(prefix + '-' + r + '-' + c, isNew)
    ));

  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const inVariantRunner = <T extends InvTest> (label: string, mvTest: () => T, timelimit: number): number => {
    let times = 0;
    const startTime = Date.now();
    while (Date.now() - startTime < timelimit) {
      const testSpec = mvTest();
      // console.log('testing:', label, i + ' / ' + times, ' params: ' + JSON.stringify(testSpec.params));
      testSpec.test();
      times++;
    }
    return times;
  };

  const gridGen = (isNew: boolean, prefix?: string) => {
    const cols = rand(GRID_MIN, GRID_MAX);
    const rows = rand(GRID_MIN, GRID_MAX);
    return {
      rows,
      cols,
      grid: grid(isNew, rows, cols, prefix)
    };
  };

  const startGen = (gridSpec: ReturnType<typeof gridGen>) => {
    // because arrays start from 0 we -1
    const row = rand(0, gridSpec.rows - 1);
    const col = rand(0, gridSpec.cols - 1);
    return Structs.address(row, col);
  };

  const deltaGen = () => {
    const rowDelta = rand(-GRID_MAX, GRID_MAX);
    const colDelta = rand(-GRID_MAX, GRID_MAX);
    return {
      rowDelta,
      colDelta
    };
  };

  const measureIVTest = () => {
    const gridSpecA = gridGen(false);
    const gridSpecB = gridGen(true);
    const start = startGen(gridSpecA);

    const rowDelta = (gridSpecA.rows - start.row) - gridSpecB.rows;
    const colDelta = (gridSpecA.cols - start.column) - gridSpecB.cols;

    const info = {
      start: {
        row: start.row,
        column: start.column
      },
      gridA: {
        rows: gridSpecA.rows,
        cols: gridSpecA.cols
      },
      gridB: {
        rows: gridSpecB.rows,
        cols: gridSpecB.cols
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

  const tailorTestIVTest = () => {
    const gridSpecA = gridGen(false);
    const start = startGen(gridSpecA);
    const delta = deltaGen();
    const expectedRows = delta.rowDelta < 0 ? Math.abs(delta.rowDelta) + gridSpecA.rows : gridSpecA.rows;
    const expectedCols = delta.colDelta < 0 ? Math.abs(delta.colDelta) + gridSpecA.cols : gridSpecA.cols;

    const info = {
      start: {
        row: start.row,
        column: start.column
      },
      gridA: {
        rows: gridSpecA.rows,
        cols: gridSpecA.cols
      },
      delta,
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

  const mergeGridsIVTest = () => {
    const gridSpecA = gridGen(false, 'a');
    const gridSpecB = gridGen(true, 'b');
    const start = startGen(gridSpecA);
    const info = {
      start: {
        row: start.row,
        column: start.column
      },
      gridA: {
        rows: gridSpecA.rows,
        cols: gridSpecA.cols
      },
      gridB: {
        rows: gridSpecB.rows,
        cols: gridSpecB.cols
      }
    };

    const queryliser2000 = (
      result: Result<Structs.RowCells[], string>,
      s: Structs.Address,
      specA: Spec,
      specB: Spec
    ) => {
      // expect to see some cell from specB at some address on specA
      const offsetRow = s.row;
      const offsetCol = s.column;

      const gridA = specA.grid;
      const gridB = specB.grid;

      Arr.each(result.getOrDie(), (row, ri) => {
        Arr.each(row.cells, (cell, ci) => {
          const expected = (() => {
            // Assumption: both gridA and gridB are rectangular.
            if (ri >= offsetRow && ri <= offsetRow + gridB.length - 1 &&
                ci >= offsetCol && ci <= offsetCol + gridB[0].length - 1) {
              return gridB[ri - offsetRow][ci - offsetCol];
            } else if (ri >= 0 && ri < gridA.length && ci >= 0 && ci < gridA[0].length) {
              return gridA[ri][ci];
            } else {
              return '?';
            }
          })();

          if (expected === '?') {
            Assert.eq('', true, '?_' === (cell.element as unknown as string).substring(0, 2));
          } else {
            Assert.eq('', expected.isNew, cell.isNew);
            Assert.eq('', expected.element, cell.element);
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

  /* eslint-disable no-console */
  const measureCycles = inVariantRunner('measure', measureIVTest, CYCLE_TIME);
  console.log(`ran ${measureCycles} measure tests...`);
  const tailorCycles = inVariantRunner('tailor', tailorTestIVTest, CYCLE_TIME);
  console.log('ran ' + tailorCycles + ' tailor tests...');
  const mergeCycles = inVariantRunner('merge', mergeGridsIVTest, CYCLE_TIME);
  console.log('ran ' + mergeCycles + ' merge tests...');
  console.log('FitmentIVTest done.');
});
