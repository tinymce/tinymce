import { UnitTest } from '@ephox/bedrock-client';

import * as Assertions from 'ephox/snooker/test/Assertions';

UnitTest.test('MergeOperationsTest', () => {
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

  Assertions.checkMerge(
    'TINY-6484 - merge cells where there is one or more row-scopes, resulting in a rowgroup scope.',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="rowgroup" rowspan="2">A1<br>A2<br></th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table border="1" style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="row">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>A2</td>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ],
    { startRow: 0, startCol: 0, finishRow: 1, finishCol: 0 }
  );

  Assertions.checkMerge(
    'TINY-6484 - merge cells where there is one or more col-scopes, resulting in a colgroup scope.',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="colgroup" colspan="2">A1<br>B1<br></th>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>A2</td>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table border="1" style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="col">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>A2</td>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 0, column: 1 }
    ],
    { startRow: 0, startCol: 0, finishRow: 0, finishCol: 1 }
  );

  Assertions.checkMerge(
    'TINY-6484 - merge cells where there is one or more row-scopes and one or more col-scopes, resulting in the scope attribute being removed.',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th rowspan="2">A1<br>A2<br></th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table border="1" style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="row">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<th scope="col">A2</th>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ],
    { startRow: 0, startCol: 0, finishRow: 1, finishCol: 0 }
  );

  Assertions.checkMerge(
    'TINY-6484 - merge cells where there is one or more row-scopes and one or more col-scopes, resulting in the scope attribute being removed, reverse order.',
    // Border = 1 would be here, but it is removed so that we can assert html
    '<table style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th rowspan="2">A1<br>A2<br></th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',

    '<table border="1" style="border-collapse: collapse;">' +
      '<tbody>' +
        '<tr>' +
          '<th scope="col">A1</th>' +
          '<td>B1</td>' +
          '<td>C1</td>' +
        '</tr>' +
        '<tr>' +
          '<th scope="row">A2</th>' +
          '<td>B2</td>' +
          '<td>C2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>',
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ],
    { startRow: 0, startCol: 0, finishRow: 1, finishCol: 0 }
  );

  Assertions.checkMerge(
    'TINY-6765 - merging cells in different rows that are part of a locked column should be noop',

    '<table style="border-collapse: collapse;" data-snooker-locked-cols="0"><tbody>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;" data-snooker-locked-cols="0"><tbody>' +
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
    'TINY-6765 - merging cells in different columns that are part of a locked column should be noop',

    '<table style="border-collapse: collapse;" data-snooker-locked-cols="0"><tbody>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;" data-snooker-locked-cols="0"><tbody>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 0, column: 1 },
      { section: 0, row: 0, column: 2 }
    ],
    { startRow: 0, startCol: 0, finishRow: 0, finishCol: 2 }
  );

  Assertions.checkMerge(
    'TINY-6765 - merging cells in different rows with a locked column in the table but not selected should not affect merging (0)',

    '<table style="border-collapse: collapse;" data-snooker-locked-cols="2"><tbody>' +
      '<tr><td rowspan="2">a<br>d<br></td><td>b</td><td>c</td></tr>' +
      '<tr><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;" data-snooker-locked-cols="2"><tbody>' +
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
    'TINY-6765 - merging cells in different rows and columns with a locked column in the table but not selected should not affect merging (1)',

    '<table style="border-collapse: collapse;" data-snooker-locked-cols="2"><tbody>' +
      '<tr><td colspan="2" rowspan="3">a<br>b<br>d<br>e<br>g<br>h<br></td><td>c</td></tr>' +
      '<tr><td>f</td></tr>' +
      '<tr><td>i</td></tr>' +
    '</tbody></table>',

    '<table border="1" style="border-collapse: collapse;" data-snooker-locked-cols="2"><tbody>' +
      '<tr><td>a</td><td>b</td><td>c</td></tr>' +
      '<tr><td>d</td><td>e</td><td>f</td></tr>' +
      '<tr><td>g</td><td>h</td><td>i</td></tr>' +
    '</tbody></table>',

    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 0, column: 1 },
      { section: 0, row: 1, column: 0 },
      { section: 0, row: 1, column: 1 },
      { section: 0, row: 2, column: 0 },
      { section: 0, row: 2, column: 1 }
    ],
    { startRow: 0, startCol: 0, finishRow: 2, finishCol: 1 }
  );
});
