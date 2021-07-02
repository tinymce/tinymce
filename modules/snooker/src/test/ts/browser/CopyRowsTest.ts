import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { copyRows } from 'ephox/snooker/api/CopyRows';
import * as Bridge from 'ephox/snooker/test/Bridge';

UnitTest.test('CopyRowsTest', () => {
  const check = (
    label: string,
    inputHtml: string,
    expectedHtml: string,
    section: number,
    row: number,
    column: number
  ) => {
    const table = SugarElement.fromHtml<HTMLTableElement>(inputHtml);
    Insert.append(SugarBody.body(), table);

    const rowsOpt = copyRows(table, {
      selection: [ Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie(label + ': could not follow path') ]
    }, Bridge.generators);
    const copiedHtml = rowsOpt.map((rows) => Arr.map(rows, Html.getOuter).join('')).getOr('');

    Assert.eq(label + ': Copied HTML should match', expectedHtml, copiedHtml);
    Remove.remove(table);
  };

  const defaultTable = (hasColgroup: boolean = false, lockedColumns: number[] = []) =>
    `<table ${lockedColumns.length > 0 ? `data-snooker-locked-cols="${lockedColumns.join(',')}"` : ''}>` +
    `${hasColgroup ? '<colgroup><col /><col /></colgroup>' : ''}` +
    '<thead>' +
    '<tr><td scope="col">H1</td><td scope="col">H2</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '<tr><td>A3</td><td>B3</td></tr>' +
    '</tbody>' +
    '<tfoot>' +
    '<tr><td>F1</td><td>F2</td></tr>' +
    '</tfoot>' +
    '</table>';

  const colspanTable = (hasColgroup: boolean = false, lockedColumns: number[] = []) =>
    `<table ${lockedColumns.length > 0 ? `data-snooker-locked-cols="${lockedColumns.join(',')}"` : ''}>` +
    `${hasColgroup ? '<colgroup><col /><col /></colgroup>' : ''}` +
    '<thead>' +
    '<tr><td>H1</td><td>H2</td><td>H3</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
    '<tr><td colspan="2">A3</td><td>C3</td></tr>' +
    '<tr><td colspan="3">A4</td></tr>' +
    '</tbody>' +
    '<tfoot>' +
    '<tr><td>F1</td><td>F2</td><td>F3</td></tr>' +
    '</tfoot>' +
    '</table>';

  const rowspanTable = (hasColgroup: boolean = false, lockedColumns: number[] = []) =>
    `<table ${lockedColumns.length > 0 ? `data-snooker-locked-cols="${lockedColumns.join(',')}"` : ''}>` +
    `${hasColgroup ? '<colgroup><col /><col /></colgroup>' : ''}` +
    '<thead>' +
    '<tr><td>H1</td><td>H2</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
    '<tr><td>B3</td></tr>' +
    '</tbody>' +
    '<tfoot>' +
    '<tr><td>F1</td><td>F2</td></tr>' +
    '</tfoot>' +
    '</table>';

  check(
    'Test copying row from basic table (0)',
    defaultTable(),
    '<tr><td scope="col">H1</td><td scope="col">H2</td></tr>',
    0, 0, 0
  );

  check(
    'Test copying row from basic table (1)',
    defaultTable(),
    '<tr><td>F1</td><td>F2</td></tr>',
    2, 0, 1
  );

  check(
    'Test copying row from colspan table (0)',
    colspanTable(),
    '<tr><td colspan="2">A3</td><td>C3</td></tr>',
    1, 1, 0
  );

  check(
    'Test copying row from colspan table (1)',
    colspanTable(),
    '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
    1, 0, 1
  );

  check(
    'Test copying row from rowspan table where rowspan cell is selected',
    rowspanTable(),
    (
      '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
      '<tr><td>B3</td></tr>'
    ),
    1, 0, 0
  );

  check(
    'Test copying row from rowspan table where rowspan cell is not selected',
    rowspanTable(),
    '<tr><td>A2</td><td>B3</td></tr>',
    1, 1, 0
  );

  check(
    'Test copying row from colgroup table - header',
    defaultTable(true),
    '<tr><td scope="col">H1</td><td scope="col">H2</td></tr>',
    1, 0, 0
  );

  check(
    'Test copying row from colgroup table - body',
    defaultTable(true),
    '<tr><td>A2</td><td>B2</td></tr>',
    2, 0, 0
  );

  check(
    'Test copying row from colgroup table - footer',
    defaultTable(true),
    '<tr><td>F1</td><td>F2</td></tr>',
    3, 0, 0
  );

  check(
    'Test copying row from colgroup table with locked colum - should not include locked column cells - header',
    defaultTable(true, [ 0 ]),
    '<tr><td scope="col">H2</td></tr>',
    1, 0, 0
  );

  check(
    'Test copying row from colgroup table with locked colum - should not include locked column cells - body',
    defaultTable(true, [ 0 ]),
    '<tr><td>B2</td></tr>',
    2, 0, 0
  );

  check(
    'Test copying row from colgroup table with locked colum - should not include locked column cells - body',
    defaultTable(true, [ 1 ]),
    '<tr><td>A2</td></tr>',
    2, 0, 0
  );

  check(
    'Test copying row from colgroup table with locked colum - should not include locked column cells - body',
    defaultTable(true, [ 0, 1 ]),
    '',
    2, 0, 0
  );

  check(
    'Test copying row from colgroup table with locked colum - should not include locked column cells - footer',
    defaultTable(true, [ 0 ]),
    '<tr><td>F2</td></tr>',
    3, 0, 0
  );

  check(
    'Test copying row from colgroup colspan table with locked column - should not include locked column cells (0)',
    colspanTable(true, [ 0 ]),
    '<tr><td>C3</td></tr>',
    2, 1, 0
  );

  check(
    'Test copying row from colgroup colspan table with locked column - should not include locked column cells (1)',
    colspanTable(true, [ 1 ]),
    '<tr><td colspan="2">A3</td><td>C3</td></tr>',
    2, 1, 0
  );

  check(
    'Test copying row from colgroup colspan table with locked column - should not include locked column cells (2)',
    colspanTable(true, [ 2 ]),
    '<tr><td colspan="2">A3</td></tr>',
    2, 1, 0
  );

  check(
    'Test copying row from colgroup colspan table with locked column - should not include locked column cells (3)',
    colspanTable(true, [ 0, 1, 2 ]),
    '',
    2, 1, 0
  );

  check(
    'Test copying row from colgroup colspan table with locked column - should not include locked column cells (4)',
    colspanTable(true, [ 0 ]),
    '',
    2, 2, 0
  );

  check(
    'Test copying row from colgroup rowspan table with locked column - should not include locked column cells (0)',
    rowspanTable(true, [ 0 ]),
    (
      '<tr><td>B2</td></tr>' +
      '<tr><td>B3</td></tr>'
    ),
    2, 0, 0
  );

  check(
    'Test copying row from colgroup rowspan table with locked column - should not include locked column cells (0)',
    rowspanTable(true, [ 1 ]),
    '<tr><td>A2</td></tr>',
    2, 1, 0
  );

  check(
    'Test copying row from colgroup rowspan table with locked column - should not include locked column cells (0)',
    rowspanTable(true, [ 0, 1 ]),
    '',
    2, 1, 0
  );
});
