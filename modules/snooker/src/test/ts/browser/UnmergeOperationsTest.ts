import { UnitTest } from '@ephox/bedrock-client';

import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('UnmergeOperationsTest', () => {
  Assertions.checkUnmerge(
    'TBA',
    '<table><tbody>' +
      '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th>?</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th>?</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TBA',
    '<table><tbody>' +
      '<tr><th>' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th>?</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th>?</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th rowspan="3">' +
      '<table><tbody>' +
        '<tr><td>1A</td><td>1B</td></tr>' +
        '<tr><td>2A</td><td>2B</td></tr>' +
      '</tbody></table>' +
      'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TBA',
    '<table><tbody>' +
    '<tr><th rowspan="3">A1</th><td>B1</td><td colspan="2">C1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>?</td></tr>' +
    '<tr><td>B3</td><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
      '<tr><th rowspan="3">A1</th><td>B1</td><td colspan="2">C1</td></tr>' +
      '<tr><td>B2</td><td rowspan="2" colspan="2">C2</td></tr>' +
      '<tr><td>B3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 1, column: 1 }
    ]
  );

  Assertions.checkUnmerge(
    'TBA',
    '<table><thead>' +
      '<tr><td>A1</td><td>?</td><td>?</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td colspan="3">A1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TBA',
    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>?</td><td>?</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td colspan="3">A2</td><td>D2</td></tr>' +
      '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 1, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6484: rowgroup-scoped cell split into cells results in all generated spells having scope row',
    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<th scope="row">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
          '<td>D1</td>' +
        '</tr>' +
        '<tr>' +
          '<th scope="row">?</th>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
          '<td>D2</td>' +
        '</tr>' +
        '<tr>' +
          '<th scope="row">?</th>' +
          '<td>B3</td>' +
          '<td>C3</td>' +
          '<td>D3</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<th rowspan="3" scope="rowgroup">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
          '<td>D1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
          '<td>D2</td>' +
        '</tr>' +
        '<tr>' +
          '<td>B3</td>' +
          '<td>C3</td>' +
          '<td>D3</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      {
        section: 0,
        row: 0,
        column: 0
      }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6484: colgroup-scoped cell split into cells results in all generated spells having scope col',
    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<th scope="col">A1</th>' +
          '<th scope="col">?</th>' +
          '<th scope="col">?</th>' +
          '<th scope="col">?</th>' +
        '</tr>' +
        '<tr>' +
          '<td>A2</td>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
          '<td>D2</td>' +
        '</tr>' +
        '<tr>' +
          '<td>A3</td>' +
          '<td>B3</td>' +
          '<td>C3</td>' +
          '<td>D3</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<th colspan="4" scope="colgroup">A1</th>' +
        '</tr>' +
        '<tr>' +
          '<td>A2</td>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
          '<td>D2</td>' +
        '</tr>' +
        '<tr>' +
          '<td>A3</td>' +
          '<td>B3</td>' +
          '<td>C3</td>' +
          '<td>D3</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      {
        section: 0,
        row: 0,
        column: 0
      }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6765 - unmerging rowpsan cells with locked column in selection should be noop',

    '<table data-snooker-locked-cols="0"><tbody>' +
      '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="0"><tbody>' +
      '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6765 - unmerging rowspan cells with a locked column in the table but not selected should not affect unmerging',

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><th>?</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><th>?</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    '<table data-snooker-locked-cols="1"><tbody>' +
      '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
      '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
      '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6765 - unmerging colspan cells where the first cell of the colspan is part of a locked column should be a noop',

    '<table data-snooker-locked-cols="0">' +
    '<tbody>' +
    '<tr><td colspan="3">A1</td></tr>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody>' +
    '</table>',

    '<table data-snooker-locked-cols="0">' +
    '<tbody>' +
    '<tr><td colspan="3">A1</td></tr>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody>' +
    '</table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  Assertions.checkUnmerge(
    'TINY-6765 - unmerging colspan cells where the first cell of the colspan is not part of a locked column should not affect unmerging',

    '<table data-snooker-locked-cols="1">' +
    '<tbody>' +
    '<tr><td>A1</td><td>?</td><td>?</td></tr>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody>' +
    '</table>',

    '<table data-snooker-locked-cols="1">' +
    '<tbody>' +
    '<tr><td colspan="3">A1</td></tr>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody>' +
    '</table>',

    [
      { section: 0, row: 0, column: 0 }
    ]
  );
});
