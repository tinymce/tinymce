import { UnitTest } from '@ephox/bedrock-client';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

UnitTest.test('PasteCellsOperationsTest', () => {
  Assertions.checkPasteRaw(
    'Test pasting 1x1 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [ '<tr><td>P1</td></tr>' ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 1x2 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>P2</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [ '<tr><td>P1</td><td>P2</td></tr>' ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 2x1 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>B1</td></tr>',
        '<tr><td>P2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td></tr>',
        '<tr><td>P2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 2x2 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>P3</td></tr>',
        '<tr><td>P2</td><td>P4</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>B1</td></tr>',
        '<tr><td>P2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>P3</td></tr>',
        '<tr><td>P2</td><td>P4</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 1x3 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>P2</td><td>P3</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [ '<tr><td>P1</td><td>P2</td><td>P3</td></tr>' ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 3x1 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>B1</td></tr>',
        '<tr><td>P2</td><td>B2</td></tr>',
        '<tr><td>P3</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td></tr>',
        '<tr><td>P2</td></tr>',
        '<tr><td>P3</td></tr>'
      ],
      [], [],
      { numCols: 1, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'Test pasting 3x3 table into 2x2 table',

    generateTestTable(
      [
        '<tr><td>P1</td><td>P4</td><td>P7</td></tr>',
        '<tr><td>P2</td><td>P5</td><td>P8</td></tr>',
        '<tr><td>P3</td><td>P6</td><td>P9</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>B1</td></tr>',
        '<tr><td>P2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>P4</td><td>P7</td></tr>',
        '<tr><td>P2</td><td>P5</td><td>P8</td></tr>',
        '<tr><td>P3</td><td>P6</td><td>P9</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  // TODO: TINY-6910: Add colspan and rowspan tests

  Assertions.checkPasteRaw(
    'TINY-6765: Test pasting 1x1 table on selected locked column - check that locked column is not pasted into',

    generateTestTable(
      [
        '<tr><td>A1</td><td>P1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [ '<tr><td>P1</td></tr>' ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'TINY-6765: Test pasting 1x1 table on table with only locked columns - check that locked columns are not pasted into (first and last locked columns should remain as first and last columns)',

    generateTestTable(
      [
        '<tr><td>A1</td><td>P1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>?</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 1 ] }
    ),

    generateTestTable(
      [ '<tr><td>P1</td></tr>' ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'TINY-6765: Test pasting 2x2 table on table with interspersed locked columns (1) - check that locked columns are not pasted into (first and last locked columns should remain as first and last columns)',

    generateTestTable(
      [
        '<tr><td>A1</td><td>P1</td><td>P3</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>P2</td><td>P4</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [ 0, 3 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>P3</td></tr>',
        '<tr><td>P2</td><td>P4</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'TINY-6765: Test pasting 2x2 table on table with interspersed locked columns (2) - check that locked columns are not pasted into (first and last locked columns should remain as first and last columns)',

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>?</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>P1</td><td>P3</td><td>C2</td></tr>',
        '<tr><td>?</td><td>P2</td><td>P4</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [ 0, 3 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>P3</td></tr>',
        '<tr><td>P2</td><td>P4</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 1, 1
  );

  Assertions.checkPasteRaw(
    'TINY-6765: Test pasting 2x2 table on table with only locked columns check that locked columns are not pasted into (first and last locked columns should remain as first and last columns)',

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>?</td><td>?</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>P1</td><td>P3</td><td>C2</td></tr>',
        '<tr><td>?</td><td>?</td><td>P2</td><td>P4</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [ 0, 1, 4 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 1, 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>P1</td><td>P3</td></tr>',
        '<tr><td>P2</td><td>P4</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 1, 1
  );

  Assertions.checkPasteRaw(
    'TINY-6675: Paste cells/col from colgroup table into non-colgroup table',

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 0, 0
  );

  Assertions.checkPasteRaw(
    'TINY-6675: Paste cells/col from colgroup table into non-colgroup table (adding new column and row)',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>?</td></tr>',
        '<tr><td>A3</td><td>X1</td><td>C2</td></tr>',
        '<tr><td>?</td><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 0, 1, 1
  );

  Assertions.checkPasteRaw(
    'TINY-6675: Paste cells/col from non-colgroup table into colgroup table',

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 1, 0, 0
  );

  Assertions.checkPasteRaw(
    'TINY-6675: Paste cells/col from non-colgroup table into colgroup table (adding new column and row)',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>?</td></tr>',
        '<tr><td>A3</td><td>X1</td><td>C2</td></tr>',
        '<tr><td>?</td><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [] }
    ),

    generateTestTable(
      [
        '<tr><td>X1</td><td>C2</td></tr>',
        '<tr><td>X2</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [] }
    ),

    TableOperations.pasteCells, 1, 1, 1
  );
});
