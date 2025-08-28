import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('SplitCellOperationsTest', () => {
  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
      '<tr><td>A1</td><td rowspan="2">B1</td></tr>' +
      '<tr><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
      '<tr><td>A1</td><td>?</td><td>B1</td></tr>' +
      '<tr><td colspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoColumns, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><thead>' +
      '<tr><td>A1</td><td rowspan="2">B1</td></tr>' +
      '<tr><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</thead></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</thead></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tfoot>' +
      '<tr><td>A1</td><td rowspan="2">B1</td></tr>' +
      '<tr><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tfoot></table>',

    '<table><tfoot>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tfoot></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><thead>' +
      '<tr><td>A1</td><td rowspan="2">B1</td></tr>' +
      '<tr><td>?</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 1, row: 0, column: 0 }),
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td rowspan="2">B2</td></tr>' +
      '<tr><td>?</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoRows, 1, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><thead>' +
      '<tr><td>A1</td><td>?</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td colspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoColumns, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 1, row: 0, column: 0 }),
    '<table><thead>' +
      '<tr><td colspan="2">A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>?</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoColumns, 1, 0, 0
  );

  Assertions.checkOld(
    'TINY-6765: Check that selected cell in locked column cannot be split into rows',
    Optional.none(),

    '<table data-snooker-locked-cols="0"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="0"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TINY-6765: Check that selected cell in locked column cannot be split into columns',
    Optional.none(),

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoColumns, 0, 0, 1
  );

  Assertions.checkOld(
    'TINY-6765: Check that selected cell can be split into rows with locked column in table',
    Optional.none(),

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><td>A1</td><td rowspan="2">B1</td></tr>' +
      '<tr><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoRows, 0, 0, 0
  );

  Assertions.checkOld(
    'TINY-6765: Check that selected cell can be split into columns with locked column in table',
    Optional.none(),

    '<table data-snooker-locked-cols="2"><tbody>' +
      '<tr><td>A1</td><td>?</td><td>B1</td></tr>' +
      '<tr><td colspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.splitCellIntoColumns, 0, 0, 0
  );
});
