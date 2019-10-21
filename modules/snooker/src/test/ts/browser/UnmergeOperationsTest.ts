import Assertions from 'ephox/snooker/test/Assertions';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('UnmergeOperationsTest', function () {
  Assertions.checkUnmerge(
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
});
