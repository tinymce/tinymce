import { describe, it } from '@ephox/bedrock-client';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

describe('PasteColumnOperationsTest', () => {
  it('TBA: Test1', () =>
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>X1</td><td>H2</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>A2</td><td>X2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>X3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>F1</td><td>X4</td><td>F2</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 0
    )
  );

  it('TBA: Test2', () =>
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td><td>X1</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>A2</td><td>B2</td><td>X2</td></tr>' +
        '<tr><td>A3</td><td>B3</td><td>X3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>F1</td><td>F2</td><td>X4</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsAfter, 1, 1, 1
    )
  );

  it('TBA: Test3', () =>
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>X1</td><td>H1</td><td>H2</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>X2</td><td>A2</td><td>B2</td></tr>' +
        '<tr><td>X3</td><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>X4</td><td>F1</td><td>F2</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 0
    )
  );

  it('TBA: Test4', () =>
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>X1</td><td>H2</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>A2</td><td>X2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>X3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>F1</td><td>X4</td><td>F2</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsBefore, 1, 1, 1
    )
  );

  it('TBA: Test5', () =>
    // Colspan
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td colspan="2">X1</td><td>H2</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>A2</td><td>X2</td><td>Y2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>X3</td><td>Y3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>F1</td><td>X4</td><td>Y4</td><td>F2</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td colspan="2">X1</td></tr><tr><td>X2</td><td>Y2</td></tr><tr><td>X3</td><td>Y3</td></tr><tr><td>X4</td><td>Y4</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 0
    )
  );

  it('TBA: Test6', () =>
    // Rowspan
    Assertions.checkPaste(
      'TBA',

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>X1</td><td>H2</td></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td>A2</td><td rowspan="2">X2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody>' +
        '<tfoot>' +
        '<tr><td>F1</td><td>X4</td><td>F2</td></tr>' +
        '</tfoot>' +
        '</table>'
      ),

      (
        '<table>' +
        '<thead>' +
        '<tr><td>H1</td><td>H2</td></tr>' +
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

      '<tr><td>X1</td></tr><tr><td rowspan="2">X2</td></tr><tr></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsBefore, 1, 0, 1
    )
  );

  it('TBA: Test pasting cols (before) into table where num of rows in copied cols is less than number of rows in the table being pasted into', () =>
    Assertions.checkPaste(
      'Test pasting cols (before) into table where num of rows in copied cols is less than number of rows in the table being pasted into',

      generateTestTable(
        [
          '<tr><td>A2</td><td>X1</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>?</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 0 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      '<tr><td>X1</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 1
    )
  );

  it('TBA: Test pasting cols (after) into table where num of rows in copied cols is less than number of rows in the table being pasted into', () =>
    Assertions.checkPaste(
      'Test pasting cols (after) into table where num of rows in copied cols is less than number of rows in the table being pasted into',

      generateTestTable(
        [
          '<tr><td>A2</td><td>X1</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>?</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 2 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 0
    )
  );

  it('TBA: Test pasting cols (before) into table where num of rows in copied cols is greater than number of rows in the table being pasted into', () =>
    Assertions.checkPaste(
      'Test pasting cols (before) into table where num of rows in copied cols is greater than number of rows in the table being pasted into',

      generateTestTable(
        [
          '<tr><td>X1</td><td>A2</td><td>B2</td></tr>',
          '<tr><td>X2</td><td>A3</td><td>B3</td></tr>',
          '<tr><td>X3</td><td>?</td><td>?</td></tr>',
          '<tr><td>X4</td><td>?</td><td>?</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 2 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 0
    )
  );

  it('TBA: Test pasting cols (after) into table where num of rows in copied cols is greater than number of rows in the table being pasted into', () =>
    Assertions.checkPaste(
      'Test pasting cols (after) into table where num of rows in copied cols is greater than number of rows in the table being pasted into',

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td><td>X1</td></tr>',
          '<tr><td>A3</td><td>B3</td><td>X2</td></tr>',
          '<tr><td>?</td><td>?</td><td>X3</td></tr>',
          '<tr><td>?</td><td>?</td><td>X4</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 0 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr><tr><td>X3</td></tr><tr><td>X4</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 1
    )
  );

  it('TINY-6765: Test that pasting cols (before) is a noop when the first column in the table is locked and selected', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (before) is a noop when the first column in the table is locked and selected',

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 0
    )
  );

  it('TINY-6765: Test that pasting cols (after) is not a noop when the first column in the table is locked and selected', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (after) is not a noop when the first column in the table is locked and selected',

      generateTestTable(
        [
          '<tr><td>A2</td><td>X1</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>X2</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 0 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 0
    )
  );

  it('TINY-6765: Test that pasting cols (before) is not a noop when the last column in the table is locked and selected', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (before) is not a noop when the last column in the table is locked and selected',

      generateTestTable(
        [
          '<tr><td>A2</td><td>X1</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>X2</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 2 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 1
    )
  );

  it('TINY-6765: Test that pasting cols (after) is a noop when the last column in the table is locked and selected', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (after) is a noop when the last column in the table is locked and selected',

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 1 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td></tr>',
          '<tr><td>A3</td><td>B3</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 1
    )
  );

  it('TINY-6765: Test that pasting cols (before) is not a noop when the selected locked column is not the first or last column', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (before) is not a noop when the selected locked column is not the first or last column',

      generateTestTable(
        [
          '<tr><td>A2</td><td>X1</td><td>B2</td><td>C2</td></tr>',
          '<tr><td>A3</td><td>X2</td><td>B3</td><td>C3</td></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 2 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
          '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsBefore, 0, 0, 1
    )
  );

  it('TINY-6765: Test that pasting cols (after) is not a noop when the selected locked column is not the first or last column', () =>
    Assertions.checkPaste(
      'TINY-6765: Test that pasting cols (after) is not a noop when the selected locked column is not the first or last column',

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td><td>X1</td><td>C2</td></tr>',
          '<tr><td>A3</td><td>B3</td><td>X2</td><td>C3</td></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 1 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
          '<tr><td>A3</td><td>B3</td><td>C3</td></tr>'
        ],
        [], [],
        { numCols: 3, colgroup: false, lockedColumns: [ 1 ] }
      ),

      '<tr><td>X1</td></tr><tr><td>X2</td></tr>',

      TableOperations.pasteColsAfter, 0, 0, 1
    )
  );

  it('TINY-8040: Paste a column into the middle of a large colspan, after version', () =>
    Assertions.checkPaste(
      'Paste a column into the middle of a large colspan',

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>X</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="5">A2</td><td>?</td><td colspan="3">?</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="8">A2</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<tr>' +
          '<td>X</td>' +
        '</tr>' +
        '<tr></tr>'
      ),

      TableOperations.pasteColsAfter, 0, 0, 5
    )
  );

  it('TINY-8040: Paste a column into the middle of a large colspan, before version', () =>
    Assertions.checkPaste(
      'Paste a column into the middle of a large colspan',

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>X</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="4">A2</td><td>?</td><td colspan="4">?</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="8">A2</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<tr>' +
          '<td>X</td>' +
        '</tr>' +
        '<tr></tr>'
      ),

      TableOperations.pasteColsBefore, 0, 0, 5
    )
  );

  it('TINY-8040: Paste a column into the middle of a large colspan with no cell at the end', () =>
    Assertions.checkPaste(
      'Paste a column into the middle of a large colspan',

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>X</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="4">A2</td><td>?</td><td colspan="5">?</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td>A1</td><td colspan="9">A2</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<tr>' +
          '<td>X</td>' +
        '</tr>' +
        '<tr></tr>'
      ),

      TableOperations.pasteColsBefore, 0, 0, 5
    )
  );

  it('TINY-8040: Paste a column into the middle of a large colspan with no cell at the start', () =>
    Assertions.checkPaste(
      'Paste a column into the middle of a large colspan',

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>X</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td colspan="5">A2</td><td>?</td><td colspan="4">?</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td colspan="9">A2</td><td>A3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<tr>' +
          '<td>X</td>' +
        '</tr>' +
        '<tr></tr>'
      ),

      TableOperations.pasteColsBefore, 0, 0, 5
    )
  );

  it('TINY-8040: Paste a column into the middle of a large colspan with no cell at the start or end', () =>
    Assertions.checkPaste(
      'Paste a column into the middle of a large colspan',

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>X</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td colspan="5">A2</td><td>?</td><td colspan="5">?</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<table>' +
          '<thead>' +
            '<tr><td>H1</td><td>H2</td><td>H3</td><td>H4</td><td>H5</td><td>H6</td><td>H7</td><td>H8</td><td>H9</td><td>H0</td></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr><td colspan="10">A2</td></tr>' +
          '</tbody>' +
        '</table>'
      ),

      (
        '<tr>' +
          '<td>X</td>' +
        '</tr>' +
        '<tr></tr>'
      ),

      TableOperations.pasteColsBefore, 0, 0, 5
    )
  );

  /*
  TINY-6910
  TODO: Need a way to test multi-cell selections - will require something like Asserstions.pasteMultiple or Assertions.checkPaste should be changed to take an array
  TODO: Test colgroup tables with locked column not around selection
  */
});
