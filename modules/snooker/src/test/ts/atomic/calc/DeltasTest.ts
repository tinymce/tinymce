import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TableSize } from 'ephox/snooker/api/TableSize';
import * as Deltas from 'ephox/snooker/calc/Deltas';
import { ColumnResizing } from 'ephox/snooker/api/TableResize';

UnitTest.test('Deltas', () => {
  const min = 10;
  const check = (msg: string, expected: number[], input: number[], column: number, step: number, columnResizeBehaviour: ColumnResizing, tableSizeConfig: Record<string, string> = {}) => {
    const singleColumnWidth = (width: number, _delta: number) => {
      const newNext = Math.max(min, width + step);
      return [ newNext - width ];
    };
    const tableSize = {
      minCellWidth: Fun.constant(10),
      singleColumnWidth,
      ...tableSizeConfig
    };
    const actual = Deltas.determine(input, column, step, tableSize as TableSize, columnResizeBehaviour);
    assert.eq(expected, Arr.map(actual, (num) => Math.round(num)), `${msg}: expected: ${expected}, actual: ${actual}`);
  };

  Arr.each([ 'default', 'resizetable', 'static' ] as ColumnResizing[], (mode) => {
    check(`deltas - columnSizing: "${mode}" - single column (0)`, [ -70 ], [ 80 ], 0, -100, mode);
    check(`deltas - columnSizing: "${mode}" - single column (1)`, [ -100 ], [ 115 ], 0, -100, mode);
    check(`deltas - columnSizing: "${mode}" - single column (2)`, [ 25 ], [ 25 ], 0, 25, mode);
    check(`deltas - columnSizing: "${mode}" - no columns`, [], [], 0, 0, mode);
  });

  check(`deltas - columnSizing: "default" - two columns`, [ 50, -50 ], [ 200, 200 ], 0, 50, 'default');
  check(`deltas - columnSizing: "resizetable" - two columns`, [ 50, 0 ], [ 200, 200 ], 0, 50, 'resizetable');
  check(`deltas - columnSizing: "static" - two columns`, [ 50, -50 ], [ 200, 200 ], 0, 50, 'static');

  check('deltas - columnSizing: "static" - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, 'static');
  check('deltas - columnSizing: "static" - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, 'static');
  check('deltas - columnSizing: "static" - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, 'static');
  check('deltas - columnSizing: "static" - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, 'static');

  check('deltas - columnSizing: "static" - second column bar (0)', [ 0, -20, 20, 0 ], [ 100, 50, 250, 100 ], 1, -20, 'static');
  check('deltas - columnSizing: "static" - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -200, 'static');
  check('deltas - columnSizing: "static" - second column bar (2)', [ 0, 20, -20, 0 ], [ 100, 50, 250, 100 ], 1, 20, 'static');
  check('deltas - columnSizing: "static" - second column bar (3)', [ 0, 80, -80, 0 ], [ 100, 50, 250, 100 ], 1, 80, 'static');

  check('deltas - columnSizing: "static" - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50, 'static');
  check('deltas - columnSizing: "static" - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100, 'static');
  check('deltas - columnSizing: "static" - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50, 'static');
  check('deltas - columnSizing: "static" - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150, 'static');

  check('deltas - columnSizing: "resizetable" - first column bar (0)', [ -20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, 'resizetable');
  check('deltas - columnSizing: "resizetable" - first column bar (1)', [ -90, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, 'resizetable');
  check('deltas - columnSizing: "resizetable" - first column bar (2)', [ 20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, 'resizetable');
  check('deltas - columnSizing: "resizetable" - first column bar (3)', [ 80, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, 'resizetable');

  check('deltas - columnSizing: "resizetable" - second column bar (0)', [ 0, -20, 0, 0 ], [ 100, 50, 250, 100 ], 1, -20, 'resizetable');
  check('deltas - columnSizing: "resizetable" - second column bar (1)', [ 0, -40, 0, 0 ], [ 100, 50, 250, 100 ], 1, -200, 'resizetable');
  check('deltas - columnSizing: "resizetable" - second column bar (2)', [ 0, 20, 0, 0 ], [ 100, 50, 250, 100 ], 1, 20, 'resizetable');
  check('deltas - columnSizing: "resizetable" - second column bar (3)', [ 0, 80, 0, 0 ], [ 100, 50, 250, 100 ], 1, 80, 'resizetable');

  check('deltas - columnSizing: "resizetable" - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50, 'resizetable');
  check('deltas - columnSizing: "resizetable" - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100, 'resizetable');
  check('deltas - columnSizing: "resizetable" - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50, 'resizetable');
  check('deltas - columnSizing: "resizetable" - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150, 'resizetable');

  check('deltas - columnSizing: "default" - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, 'default');
  check('deltas - columnSizing: "default" - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, 'default');
  check('deltas - columnSizing: "default" - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, 'default');
  check('deltas - columnSizing: "default" - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, 'default');

  check('deltas - columnSizing: "default" - second column bar (0)', [ 0, -20, 20, 0 ], [ 100, 50, 250, 100 ], 1, -20, 'default');
  check('deltas - columnSizing: "default" - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -200, 'default');
  check('deltas - columnSizing: "default" - second column bar (2)', [ 0, 20, -20, 0 ], [ 100, 50, 250, 100 ], 1, 20, 'default');
  check('deltas - columnSizing: "default" - second column bar (3)', [ 0, 80, -80, 0 ], [ 100, 50, 250, 100 ], 1, 80, 'default');

  check('deltas - columnSizing: "default" - last column bar (relative) (0)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, 50, 'default', { widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (1)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, 100, 'default', { widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (2)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, -50, 'default', { widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (3)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, -150, 'default', { widthType: 'relative' });

  check('deltas - columnSizing: "default" - last column bar (fixed) (0)', [ 10, 5, 25, 10 ], [ 100, 50, 250, 100 ], 3, 50, 'default', { widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (1)', [ 20, 10, 50, 20 ], [ 100, 50, 250, 100 ], 3, 100, 'default', { widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (2)', [ -10, -5, -25, -10 ], [ 100, 50, 250, 100 ], 3, -50, 'default', { widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (3)', [ -30, -15, -75, -30 ], [ 100, 50, 250, 100 ], 3, -150, 'default', { widthType: 'fixed' });
});
