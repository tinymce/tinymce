import { UnitTest } from '@ephox/bedrock-client';
import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('PasteColumnOperationsTest', () => {
  Assertions.checkPaste(
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
  );

  Assertions.checkPaste(
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
  );

  Assertions.checkPaste(
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
  );

  Assertions.checkPaste(
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
  );

  // Colspan
  Assertions.checkPaste(
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
  );

  // Rowspan
  Assertions.checkPaste(
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
  );
});
