import { UnitTest } from '@ephox/bedrock-client';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

UnitTest.test('PasteRowOperationsTest', () => {
  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsAfter, 0, 0, 0
  );

  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsAfter, 1, 1, 0
  );

  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsAfter, 2, 0, 0
  );

  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsBefore, 0, 0, 0
  );

  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsBefore, 1, 1, 0
  );

  Assertions.checkPaste(
    'TBA',

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>X1</td><td>X2</td></tr>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    (
      '<table>' +
        '<thead>' +
          '<tr><td>H1</td><td>H1</td></tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr><td>A2</td><td>B2</td></tr>' +
          '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
          '<tr><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
      '</table>'
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsBefore, 2, 0, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (before) into table where num of cols in copied rows is less than number of cols in the table being pasted into',

    generateTestTable(
      [
        '<tr><td>X1</td><td>?</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
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

    '<tr><td>X1</td></tr>',

    TableOperations.pasteRowsBefore, 0, 0, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (after) into table where num of cols in copied rows is less than number of cols in the table being pasted into',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>X1</td><td>?</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
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

    '<tr><td>X1</td></tr>',

    TableOperations.pasteRowsAfter, 0, 0, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (before) into table where num of cols in copied rows is greater than number of cols in the table being pasted into',

    generateTestTable(
      [
        '<tr><td>X1</td><td>X2</td><td>X3</td><td>X4</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>?</td><td>?</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>?</td><td>?</td></tr>'
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

    '<tr><td>X1</td><td>X2</td><td>X3</td><td>X4</td></tr>',

    TableOperations.pasteRowsBefore, 0, 0, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (after) into table where num of cols in copied rows is greater than number of cols in the table being pasted into',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>?</td><td>?</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>?</td><td>?</td></tr>',
        '<tr><td>X1</td><td>X2</td><td>X3</td><td>X4</td></tr>'
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

    '<tr><td>X1</td><td>X2</td><td>X3</td><td>X4</td></tr>',

    TableOperations.pasteRowsAfter, 0, 1, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (before) into table where there are locked columns - should wrap around locked columns (last locked column should remain as last column)',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>?</td><td>C2</td></tr>',
        '<tr><td>?</td><td>X1</td><td>X2</td><td>?</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>?</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 3 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 2 ] }
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsBefore, 0, 1, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (after) into table where there are locked columns - should wrap around locked columns (last locked column should remain as last column)',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>?</td><td>C2</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>?</td><td>C3</td></tr>',
        '<tr><td>?</td><td>X1</td><td>X2</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 3 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 2 ] }
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsAfter, 0, 1, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (after) into table where all columns are locked - (first and last locked column should remain as first and last column)',

    generateTestTable(
      [
        '<tr><td>A2</td><td>?</td><td>?</td><td>B2</td></tr>',
        '<tr><td>?</td><td>X1</td><td>X2</td><td>?</td></tr>',
        '<tr><td>A3</td><td>?</td><td>?</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 3 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td></tr>',
        '<tr><td>A3</td><td>B3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 0, 1 ] }
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsAfter, 0, 0, 0
  );

  Assertions.checkPaste(
    'TINY-6765: Test pasting rows (before) with less cols into table where there are locked columns',

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
        '<tr><td>X1</td><td>X2</td><td>?</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: false, lockedColumns: [ 2 ] }
    ),

    '<tr><td>X1</td><td>X2</td></tr>',

    TableOperations.pasteRowsBefore, 0, 1, 0
  );
});
