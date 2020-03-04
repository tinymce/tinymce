import * as Assertions from 'ephox/snooker/test/Assertions';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('MergeOperationsTest', function () {
  Assertions.checkMerge(
    'SimpleCase - merging textnodes should move all content into the first cell separarted by BRs',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;"><tbody>' +
      '<tr><td rowspan="2">a<br>d<br></td><td>b</td><td>c</td></tr>' +
      '<tr><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;"><tbody>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ],
    { startRow: 0, startCol: 0, finishRow: 1, finishCol: 0 }
  );

  Assertions.checkMerge(
    'SimpleCase - merging textnodes should move all content into the first cell separarted by BRs',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;"><thead>' +
      '<tr><td rowspan="2">a<br>d<br></td><td>b</td><td>c</td></tr>' +
      '<tr><td>e</td><td>f</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
      '<tr><td>j</td><td>k</td><td>l</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;"><thead>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
      '<tr><td>j</td><td>k</td><td>l</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ],
    { startRow: 0, startCol: 0, finishRow: 1, finishCol: 0 }
  );

  Assertions.checkMerge(
    'SimpleCase - merging textnodes should move all content into the first cell separarted by BRs',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;"><thead>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td rowspan="2">g<br>j<br></td><td>h</td><td>i</td></tr>' +
      '<tr><td>k</td><td>l</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;"><thead>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
      '<tr><td>j</td><td>k</td><td>l</td></tr>' +
    '</tbody></table>',

    [
      { section: 1, row: 0, column: 0 },
      { section: 1, row: 1, column: 0 }
    ],
    { startRow: 2, startCol: 0, finishRow: 3, finishCol: 0 }
  );
});
