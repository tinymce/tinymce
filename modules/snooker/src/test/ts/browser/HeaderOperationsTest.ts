import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import { TableSection } from 'ephox/snooker/api/TableSection';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

UnitTest.test('HeaderOperationsTest', () => {
  const testSingleRowSection = () => {
    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowBody, 0, 0, 1
    );

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

      TableOperations.makeRowBody, 0, 0, 1
    );

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

      TableOperations.makeRowBody, 0, 0, 1
    );

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 1 }),
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

      TableOperations.makeRowBody, 1, 0, 1
    );

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOld(
      'TINY-6666: Convert body to header (section cells)',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table>' +
      '<thead><tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr></thead>' +
      '<tbody><tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr></tbody>' +
      '</table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowHeader, 0, 0, 1, TableSection.sectionCells()
    );

    Assertions.checkOld(
      'TINY-6666: Convert body to header (section)',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table>' +
      '<thead><tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr></thead>' +
      '<tbody><tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr></tbody>' +
      '</table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowHeader, 0, 0, 0, TableSection.section()
    );

    Assertions.checkOld(
      'TINY-6666: Convert body to footer (section)',
      Optional.some({ section: 1, row: 0, column: 1 }),
      '<table>' +
      '<tbody><tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr></tbody>' +
      '<tfoot><tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr></tfoot>' +
      '</table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowFooter, 0, 0, 1, TableSection.section()
    );

    Assertions.checkOld(
      'TINY-6666: Convert header to footer (section cells)',
      Optional.some({ section: 1, row: 0, column: 1 }),
      '<table>' +
      '<tbody><tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr></tbody>' +
      '<tfoot><tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr></tfoot>' +
      '</table>',

      '<table>' +
      '<thead><tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr></thead>' +
      '<tbody><tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr></tbody>' +
      '</table>',

      TableOperations.makeRowFooter, 0, 0, 1, TableSection.sectionCells()
    );

    Assertions.checkOld(
      'TINY-7709: Convert single row with colspan to header',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
      '<tr><th colspan="2" scope="colgroup">A1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td colspan="2">A1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowHeader, 0, 0, 1
    );
  };

  const testMultipleRowSection = () => {
    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsBody, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

      TableOperations.makeRowsBody, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

      TableOperations.makeRowsBody, [{
        section: 0,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 1 }),
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

      TableOperations.makeRowsBody, [{
        section: 1,
        row: 0,
        column: 1
      }]
    );

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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

      TableOperations.makeRowsBody, [
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 1 }),
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
            '<td>A2</td>' +
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

    Assertions.checkOldMultiple(
      'TINY-6666: Footer rows to header rows (section cells)',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><thead>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><th scope="col">A2</th><th scope="col">B2</th><th scope="col">C2</th><th scope="col">D2</th></tr>' +
      '</thead></table>',

      '<table><tfoot>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tfoot></table>',

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
      ], TableSection.sectionCells()
    );

    Assertions.checkOldMultiple(
      'TINY-6666: Body rows to footer rows (section)',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tfoot>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tfoot></table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsFooter, [
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
      ], TableSection.section()
    );

    Assertions.checkOldMultiple(
      'TINY-6666: Header rows to footer rows (section cells)',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tfoot>' +
      '<tr><td>A1</td><td>B1</td><td rowspan="2">C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>D2</td></tr>' +
      '</tfoot></table>',

      '<table><thead>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col" rowspan="2">C1</th><th scope="col">D1</th></tr>' +
      '<tr><th scope="col">A2</th><th scope="col">B2</th><th scope="col">D2</th></tr>' +
      '</thead></table>',

      TableOperations.makeRowsFooter, [
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
      ], TableSection.sectionCells()
    );
  };

  const testSingleColumnHeader = () => {
    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 0 }),
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

    Assertions.checkOld(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 0 }),
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

    Assertions.checkOld(
      'Check that locked column is not converted to a header column',
      Optional.none(),
      generateTestTable(
        [
          '<tr><td>A1</td><td>B1</td></tr>',
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

      TableOperations.makeColumnHeader, 0, 0, 0
    );

    Assertions.checkOld(
      'TINY-6765: Check that locked header column is not converted to a normal column',
      Optional.none(),
      generateTestTable(
        [
          '<tr><th scope="row">A1</th><td>B1</td></tr>',
          '<tr><th scope="row">A2</th><td>B2</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      generateTestTable(
        [
          '<tr><th scope="row">A1</th><td>B1</td></tr>',
          '<tr><th scope="row">A2</th><td>B2</td></tr>'
        ],
        [], [],
        { numCols: 2, colgroup: false, lockedColumns: [ 0 ] }
      ),

      TableOperations.unmakeColumnHeader, 0, 0, 0
    );

    Assertions.checkOld(
      'TINY-7709: Convert single column with rowspan to header',
      Optional.some({ section: 0, row: 2, column: 0 }),
      '<table><tbody>' +
      '<tr><th rowspan="2" scope="rowgroup">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td rowspan="2">A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.makeColumnHeader, 0, 2, 0
    );
  };

  const testMultipleColumnHeader = () => {
    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 1, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 0, row: 0, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TBA',
      Optional.some({ section: 1, row: 0, column: 0 }),
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

    Assertions.checkOldMultiple(
      'TINY-6765: Check that locked columns in the selection are not converted to header columns',
      Optional.some({ section: 0, row: 1, column: 0 }),

      generateTestTable(
        [
          '<tr><th scope="row">A1</th><td>B1</td><th scope="row">C1</th><td>D1</td></tr>',
          '<tr><th scope="row">A2</th><td>B2</td><th scope="row">C2</th><td>D2</td></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 1, 3 ] }
      ),

      generateTestTable(
        [
          '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>',
          '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 1, 3 ] }
      ),

      TableOperations.makeColumnsHeader,
      [
        { section: 0, row: 1, column: 0 },
        { section: 0, row: 1, column: 1 },
        { section: 0, row: 1, column: 2 },
        { section: 0, row: 1, column: 3 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-6765: Check that locked header columns are not converted to normal columns',
      Optional.some({ section: 0, row: 1, column: 0 }),

      generateTestTable(
        [
          '<tr><td>A1</td><th scope="row">B1</th><td>C1</td><th scope="row">D1</th></tr>',
          '<tr><td>A2</td><th scope="row">B2</th><td>C2</td><th scope="row">D2</th></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 1, 3 ] }
      ),

      generateTestTable(
        [
          '<tr><th scope="row">A1</th><th scope="row">B1</th><th scope="row">C1</th><th scope="row">D1</th></tr>',
          '<tr><th scope="row">A2</th><th scope="row">B2</th><th scope="row">C2</th><th scope="row">D2</th></tr>'
        ],
        [], [],
        { numCols: 4, colgroup: false, lockedColumns: [ 1, 3 ] }
      ),

      TableOperations.unmakeColumnsHeader,
      [
        { section: 0, row: 1, column: 0 },
        { section: 0, row: 1, column: 1 },
        { section: 0, row: 1, column: 2 },
        { section: 0, row: 1, column: 3 }
      ]
    );
  };

  const testSingleCellHeader = () => {
    Assertions.checkOld(
      'Convert single regular cell to header cell',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
      '<tr><td>A1</td><th>B1</th><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeCellHeader, 0, 0, 1
    );

    Assertions.checkOld(
      'Convert single regular cell with colspan to header cell',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
      '<tr><td>A1</td><th colspan="2">B1</th><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td colspan="2">B1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeCellHeader, 0, 0, 1
    );

    Assertions.checkOld(
      'Convert single header cell to regular cell',
      Optional.some({ section: 1, row: 0, column: 1 }),
      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th>A2</th><td>B2</td><th>C2</th><th>D2</th></tr>' +
      '</tbody></table>',

      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th>A2</th><th>B2</th><th>C2</th><th>D2</th></tr>' +
      '</tbody></table>',

      TableOperations.unmakeCellHeader, 1, 0, 1
    );

    Assertions.checkOld(
      'Convert single header cell with scope to regular cell',
      Optional.some({ section: 1, row: 0, column: 1 }),
      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="col">A2</th><td>B2</td><th scope="col">C2</th><th scope="col">D2</th></tr>' +
      '</tbody></table>',

      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="col">A2</th><th scope="col">B2</th><th scope="col">C2</th><th scope="col">D2</th></tr>' +
      '</tbody></table>',

      TableOperations.unmakeCellHeader, 1, 0, 1
    );
  };

  const testMultipleCellHeader = () => {
    Assertions.checkOldMultiple(
      'Convert multiple regular cells to header cells',
      Optional.some({ section: 0, row: 0, column: 1 }),
      '<table><tbody>' +
      '<tr><td>A1</td><th>B1</th><th>C1</th><th>D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.makeCellsHeader, [
        { section: 0, row: 0, column: 1 },
        { section: 0, row: 0, column: 2 },
        { section: 0, row: 0, column: 3 }
      ]
    );

    Assertions.checkOldMultiple(
      'Convert multiple header cells to regular cells',
      Optional.some({ section: 0, row: 0, column: 2 }),
      '<table><thead>' +
      '<tr><th>A1</th><th>B1</th><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      '<table><thead>' +
      '<tr><th>A1</th><th>B1</th><th>C1</th><th>D1</th></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '</tbody></table>',

      TableOperations.unmakeCellsHeader, [
        { section: 0, row: 0, column: 2 },
        { section: 0, row: 0, column: 3 }
      ]
    );

    Assertions.checkOldMultiple(
      'Convert multiple header cells with scope to regular cell',
      Optional.some({ section: 1, row: 0, column: 0 }),
      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><th scope="col">C2</th><th scope="col">D2</th></tr>' +
      '</tbody></table>',

      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th scope="col">A2</th><th scope="col">B2</th><th scope="col">C2</th><th scope="col">D2</th></tr>' +
      '</tbody></table>',

      TableOperations.unmakeCellsHeader, [
        { section: 1, row: 0, column: 0 },
        { section: 1, row: 0, column: 1 }
      ]
    );
  };

  const testMixedHeaders = () => {
    Assertions.checkOldMultiple(
      'TINY-7709: Convert regular column to header column with an existing header row',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><tbody>' +
      '<tr><th scope="row">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.makeColumnsHeader, [
        { section: 0, row: 0, column: 0 },
        { section: 0, row: 1, column: 0 },
        { section: 0, row: 2, column: 0 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-7709: Convert header column to regular column with an existing header row',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><th scope="row">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.unmakeColumnsHeader, [
        { section: 0, row: 0, column: 0 },
        { section: 0, row: 1, column: 0 },
        { section: 0, row: 2, column: 0 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-7709: Convert header column to regular column with an existing thead section header row',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><th>C1</th><th>D1</th></tr>' +
      '</thead><tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><thead>' +
      '<tr><th scope="row">A1</th><td>B1</td><th>C1</th><th>D1</th></tr>' +
      '</thead><tbody>' +
      '<tr><th scope="row">A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.unmakeColumnsHeader, [
        { section: 0, row: 0, column: 0 },
        { section: 1, row: 0, column: 0 },
        { section: 1, row: 1, column: 0 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-7709: Convert regular row to header row with an existing header column',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><th scope="row">B2</th><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><th scope="row">B3</th><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><td>A1</th><th scope="row">B1</th><td>C1</td><td>D1</th></tr>' +
      '<tr><td>A2</td><th scope="row">B2</th><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><th scope="row">B3</th><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsHeader, [
        { section: 0, row: 0, column: 0 },
        { section: 0, row: 0, column: 1 },
        { section: 0, row: 0, column: 2 },
        { section: 0, row: 0, column: 3 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-7709: Convert header row to regular row with an existing header column',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><tbody>' +
      '<tr><td>A1</td><th scope="row">B1</th><td>C1</td><td>D1</td></tr>' +
      '<tr><td>A2</td><th scope="row">B2</th><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><th scope="row">B3</th><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><th scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>A2</td><th scope="row">B2</th><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><th scope="row">B3</th><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsBody, [
        { section: 0, row: 0, column: 0 },
        { section: 0, row: 0, column: 1 },
        { section: 0, row: 0, column: 2 },
        { section: 0, row: 0, column: 3 }
      ]
    );

    Assertions.checkOldMultiple(
      'TINY-7709: Convert header row with rowspan to regular row with an existing header column',
      Optional.some({ section: 0, row: 0, column: 0 }),
      '<table><tbody>' +
      '<tr><th rowspan="2" scope="rowgroup">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
      '<tr><th rowspan="2" scope="col">A1</th><th scope="col">B1</th><th scope="col">C1</th><th scope="col">D1</th></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th scope="row">A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      TableOperations.makeRowsBody, [
        { section: 0, row: 0, column: 0 },
        { section: 0, row: 0, column: 1 },
        { section: 0, row: 0, column: 2 },
        { section: 0, row: 0, column: 3 }
      ]
    );
  };

  testSingleRowSection();
  testMultipleRowSection();
  testSingleColumnHeader();
  testMultipleColumnHeader();
  testSingleCellHeader();
  testMultipleCellHeader();
  testMixedHeaders();
});
