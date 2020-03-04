import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('InsertOperationsTest', function () {
  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><tbody>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><tbody>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 2, column: 0 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 2, column: 0 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><tbody>' +
      '<tr><td>?</td><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>?</td><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><tbody>' +
      '<tr><td>?</td><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>?</td><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 1 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>?</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>?</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>?</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>?</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 2 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>?</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>?</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>?</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>?</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 2 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 1
  );

  Assertions.checkStructure({ section: 0, row: 1, column: 1 },
    [
      [ 'A', '?', 'B', 'C' ],
      [ 'D', '?', 'E' ],
      [ 'F' ],
      [ 'G' ],
      [ 'H' ],
      [ 'I', '?', 'J', 'K' ],
      [ 'L', 'M' ]
    ],

    '<table style="width: 400px; border-collapse: collapse;">' +
    '<tbody>' +
      '<tr>' +
        '<td>A</td><td rowspan="2" colspan="2">B</td><td>C</td>' +
      '</tr>' +
      '<tr><td>D</td><td colspan="1" rowspan="2">E</td></tr>' +
      '<tr><td colspan="3" rowspan="3">F</td></tr>' +
      '<tr><td>G</td></tr>' +
      '<tr><td>H</td></tr>' +
      '<tr><td rowspan="2" colspan="1">I</td><td>J</td><td colspan="2">K</td></tr>' +
      '<tr><td colspan="2">L</td><td>M</td></tr>' +
    '</tbody>' +
    '</table>',

    TableOperations.insertColumnAfter, 0, 1, 0
  );

  // Irregular tables (inserting row where one row has an irregular cell.
  Assertions.checkOld({ section: 0, row: 2, column: 0 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>IRREGULAR CELL</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>?</td></tr>' +
      '<tr><td>?</td><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>IRREGULAR CELL</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><thead>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
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

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 1, row: 0, column: 0 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 1, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
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

    TableOperations.insertRowAfter, 0, 0, 0
  );

  Assertions.checkOld({ section: 1, row: 1, column: 0 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 1, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><tbody>' +
      '<tr><td>?</td><td>?</td></tr>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld({ section: 1, row: 1, column: 1 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 1, 0, 1
  );
});
