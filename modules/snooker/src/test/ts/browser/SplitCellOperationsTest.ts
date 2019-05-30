import TableOperations from 'ephox/snooker/api/TableOperations';
import Assertions from 'ephox/snooker/test/Assertions';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('MergeOperationsTest', function () {
  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 1, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
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

  Assertions.checkOld({ section: 1, row: 0, column: 0 },
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
});
