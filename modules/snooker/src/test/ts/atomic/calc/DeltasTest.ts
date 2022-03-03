import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';

import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { TableSize } from 'ephox/snooker/api/TableSize';
import * as Deltas from 'ephox/snooker/calc/Deltas';

UnitTest.test('DeltasTest', () => {
  const preserveTable = ResizeBehaviour.preserveTable();
  const resizeTable = ResizeBehaviour.resizeTable();

  const min = 10;
  const check = (msg: string, expected: number[], input: number[], column: number, step: number, resizeBehaviour: ResizeBehaviour.ResizeBehaviour) => {
    const singleColumnWidth = (width: number, _delta: number) => {
      const newNext = Math.max(min, width + step);
      return [ newNext - width ];
    };
    const tableSize = {
      minCellWidth: Fun.constant(10),
      singleColumnWidth,
      isRelative: false
    };
    const actual = Deltas.determine(input, column, step, tableSize as TableSize, resizeBehaviour);
    Assert.eq(`${msg}: expected: ${expected}, actual: ${actual}`, expected, Arr.map(actual, (num) => Math.round(num)));
  };

  Arr.each([ resizeTable, preserveTable ], (mode) => {
    const modeName = mode === resizeTable ? 'resizeTable' : 'preserveTable';
    check(`deltas - columnSizing: "${modeName}" - single column (0)`, [ -70 ], [ 80 ], 0, -100, mode);
    check(`deltas - columnSizing: "${modeName}" - single column (1)`, [ -100 ], [ 115 ], 0, -100, mode);
    check(`deltas - columnSizing: "${modeName}" - single column (2)`, [ 25 ], [ 25 ], 0, 25, mode);
    check(`deltas - columnSizing: "${modeName}" - no columns`, [], [], 0, 0, mode);
  });

  check(`deltas - columnSizing: preserveTable - two columns`, [ 50, -50 ], [ 200, 200 ], 0, 50, preserveTable);
  check(`deltas - columnSizing: resizeTable" - two columns`, [ 50, 0 ], [ 200, 200 ], 0, 50, resizeTable);

  check('deltas - columnSizing: resizeTable" - first column bar (0)', [ -20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, resizeTable);
  check('deltas - columnSizing: resizeTable" - first column bar (1)', [ -90, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, resizeTable);
  check('deltas - columnSizing: resizeTable" - first column bar (2)', [ 20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, resizeTable);
  check('deltas - columnSizing: resizeTable" - first column bar (3)', [ 80, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, resizeTable);

  check('deltas - columnSizing: resizeTable" - second column bar (0)', [ 0, -20, 0, 0 ], [ 100, 50, 250, 100 ], 1, -20, resizeTable);
  check('deltas - columnSizing: resizeTable" - second column bar (1)', [ 0, -40, 0, 0 ], [ 100, 50, 250, 100 ], 1, -200, resizeTable);
  check('deltas - columnSizing: resizeTable" - second column bar (2)', [ 0, 20, 0, 0 ], [ 100, 50, 250, 100 ], 1, 20, resizeTable);
  check('deltas - columnSizing: resizeTable" - second column bar (3)', [ 0, 80, 0, 0 ], [ 100, 50, 250, 100 ], 1, 80, resizeTable);

  check('deltas - columnSizing: resizeTable" - third column bar (0)', [ 0, 0, -20, 0 ], [ 100, 50, 250, 100 ], 2, -20, resizeTable);
  check('deltas - columnSizing: resizeTable" - third column bar (1)', [ 0, 0, -200, 0 ], [ 100, 50, 250, 100 ], 2, -200, resizeTable);
  check('deltas - columnSizing: resizeTable" - third column bar (2)', [ 0, 0, 20, 0 ], [ 100, 50, 250, 100 ], 2, 20, resizeTable);
  check('deltas - columnSizing: resizeTable" - third column bar (3)', [ 0, 0, 80, 0 ], [ 100, 50, 250, 100 ], 2, 80, resizeTable);

  check('deltas - columnSizing: resizeTable" - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50, resizeTable);
  check('deltas - columnSizing: resizeTable" - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100, resizeTable);
  check('deltas - columnSizing: resizeTable" - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50, resizeTable);
  check('deltas - columnSizing: resizeTable" - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150, resizeTable);

  check('deltas - columnSizing: preserveTable - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, preserveTable);
  check('deltas - columnSizing: preserveTable - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, preserveTable);
  check('deltas - columnSizing: preserveTable - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, preserveTable);
  check('deltas - columnSizing: preserveTable - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, preserveTable);

  check('deltas - columnSizing: preserveTable - second column bar (0)', [ 0, -20, 20, 0 ], [ 100, 50, 250, 100 ], 1, -20, preserveTable);
  check('deltas - columnSizing: preserveTable - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -200, preserveTable);
  check('deltas - columnSizing: preserveTable - second column bar (2)', [ 0, 20, -20, 0 ], [ 100, 50, 250, 100 ], 1, 20, preserveTable);
  check('deltas - columnSizing: preserveTable - second column bar (3)', [ 0, 80, -80, 0 ], [ 100, 50, 250, 100 ], 1, 80, preserveTable);

  check('deltas - columnSizing: preserveTable - third column bar (0)', [ 0, 0, -20, 20 ], [ 100, 50, 250, 100 ], 2, -20, preserveTable);
  check('deltas - columnSizing: preserveTable - third column bar (1)', [ 0, 0, -200, 200 ], [ 100, 50, 250, 100 ], 2, -200, preserveTable);
  check('deltas - columnSizing: preserveTable - third column bar (2)', [ 0, 0, 20, -20 ], [ 100, 50, 250, 100 ], 2, 20, preserveTable);
  check('deltas - columnSizing: preserveTable - third column bar (3)', [ 0, 0, 80, -80 ], [ 100, 50, 250, 100 ], 2, 80, preserveTable);

  check('deltas - columnSizing: preserveTable - last column bar (0)', [ -5, -5, -5, -5 ], [ 100, 50, 250, 100 ], 3, -20, preserveTable);
  check('deltas - columnSizing: preserveTable - last column bar (1)', [ -50, -50, -50, -50 ], [ 100, 50, 250, 100 ], 3, -200, preserveTable);
  check('deltas - columnSizing: preserveTable - last column bar (2)', [ 5, 5, 5, 5 ], [ 100, 50, 250, 100 ], 3, 20, preserveTable);
  check('deltas - columnSizing: preserveTable - last column bar (3)', [ 20, 20, 20, 20 ], [ 100, 50, 250, 100 ], 3, 80, preserveTable);
});
