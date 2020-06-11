import { UnitTest } from '@ephox/bedrock-client';
import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('PasteRowOperationsTest', () => {
  Assertions.checkPaste(
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
});
