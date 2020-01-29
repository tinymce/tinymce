import TableOperations from 'ephox/snooker/api/TableOperations';
import Assertions from 'ephox/snooker/test/Assertions';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('HeaderOperationsTest', function () {
  // TODO: Make it keep the column.
  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><th scope="col">' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th scope="col">' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeColumnHeader, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><th scope="row">' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeColumnHeader, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeColumnHeader, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 1, column: 0 },
    '<table><tbody>' +
      '<tr><td>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th scope="row">' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeColumnHeader, 0, 1, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 0 },
    '<table><thead>' +
      '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeColumnHeader, 0, 0, 0
  );

  Assertions.checkOld({ section: 1, row: 0, column: 0 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeColumnHeader, 1, 0, 0
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><thead>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.unmakeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><thead>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeRowHeader, 0, 0, 1
  );

  Assertions.checkOld({ section: 1, row: 0, column: 1 },
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="col">A2</th><th scope="col">B2</th><th scope="col">C2</th><th scope="col">D2</th></tr>' +
    '</tbody></table>',

    TableOperations.unmakeRowHeader, 1, 0, 1
  );

  Assertions.checkOld({ section: 0, row: 0, column: 1 },
    '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td rowspan="2">A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.makeRowHeader, 0, 0, 1
  );
});
