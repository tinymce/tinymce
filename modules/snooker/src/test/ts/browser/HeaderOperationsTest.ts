import { UnitTest } from '@ephox/bedrock-client';
import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('HeaderOperationsTest', function () {
  testSingleRowHeader();
  testMultipleRowHeader();
  testSingleColumnHeader();
  testMultipleColumnHeader();

  function testSingleRowHeader() {
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
  }

  function testMultipleRowHeader() {
    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
      '<table><tbody>' +
        '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
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

      TableOperations.makeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.unmakeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
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

      TableOperations.unmakeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
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

      TableOperations.makeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
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

      TableOperations.unmakeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
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

      TableOperations.makeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 1, row: 0, column: 1 },
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

      TableOperations.unmakeRowsHeader, [{
        section: 1,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
      '<table><tbody>' +
        '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td rowspan="2">A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsHeader, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<td>A1</td>' +
            '<td>B1</td>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
          '<tr>' +
            '<td>A2</td>' +
            '<td>B2</td>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</thead>' +
      '</table>',

      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th scope="col">A1</th>' +
            '<th scope="col">B1</th>' +
            '<th scope="col">C1</th>' +
            '<th scope="col">D1</th>' +
          '</tr>' +
          '<tr>' +
            '<th scope="col">A2</th>' +
            '<th scope="col">B2</th>' +
            '<th scope="col">C2</th>' +
            '<th scope="col">D2</th>' +
          '</tr>' +
        '</thead>' +
      '</table>',

      TableOperations.unmakeRowsHeader, [
        {
          section: 0,
          row: 0,
          column: 1
        },
        {
          section: 0,
          row: 1,
          column: 1
        }
      ]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 1 },
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<th scope="col">A1</th>' +
            '<th scope="col">B1</th>' +
            '<th scope="col">C1</th>' +
            '<th scope="col">D1</th>' +
          '</tr>' +
          '<tr>' +
            '<th scope="col">A2</th>' +
            '<th scope="col">B2</th>' +
            '<th scope="col">C2</th>' +
            '<th scope="col">D2</th>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>A1</td>' +
            '<td>B1</td>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
          '<tr>' +
            '<td rowspan="2">A2</td>' +
            '<td>B2</td>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      TableOperations.makeRowsHeader, [
        {
          section: 0,
          row: 0,
          column: 1
        },
        {
          section: 0,
          row: 1,
          column: 1
        }
      ]
    );
  }

  function testSingleColumnHeader() {
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
  }

  function testMultipleColumnHeader() {
    Assertions.checkOldMultiple({ section: 0, row: 1, column: 0 },
      '<table><tbody>' +
        '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeColumnsHeader, [{
        section: 0,
        row: 1,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 1, column: 0 },
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

      TableOperations.makeColumnsHeader, [{
        section: 0,
        row: 1,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 1, column: 0 },
      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th scope="row">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.unmakeColumnsHeader, [{
        section: 0,
        row: 1,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 1, column: 0 },
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

      TableOperations.unmakeColumnsHeader, [{
        section: 0,
        row: 1,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 0, row: 0, column: 0 },
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

      TableOperations.makeColumnsHeader, [{
        section: 0,
        row: 0,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 1, row: 0, column: 0 },
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

      TableOperations.unmakeColumnsHeader, [{
        section: 1,
        row: 0,
        column: 0
      }]
    );

    Assertions.checkOldMultiple({ section: 1, row: 0, column: 0 },
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th scope="row">A1</th>' +
            '<th scope="row">B1</th>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<th scope="row">A2</th>' +
            '<th scope="row">B2</th>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      '<table>' +
        '<thead>' +
          '<tr>' +
            '<td>A1</td>' +
            '<td>B1</td>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td>A2</td>' +
            '<td>B2</td>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      TableOperations.makeColumnsHeader, [
        {
          section: 1,
          row: 0,
          column: 0
        },
        {
          section: 1,
          row: 0,
          column: 1
        }
      ]
    );

    Assertions.checkOldMultiple({ section: 1, row: 0, column: 0 },
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<td>A1</td>' +
            '<td>B1</td>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td>A2</td>' +
            '<td>B2</td>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th scope="row">A1</th>' +
            '<th scope="row">B1</th>' +
            '<td>C1</td>' +
            '<td>D1</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<th scope="row">A2</th>' +
            '<th scope="row">B2</th>' +
            '<td>C2</td>' +
            '<td>D2</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',

      TableOperations.unmakeColumnsHeader, [
        {
          section: 1,
          row: 0,
          column: 0
        },
        {
          section: 1,
          row: 0,
          column: 1
        }
      ]
    );
  }
});
