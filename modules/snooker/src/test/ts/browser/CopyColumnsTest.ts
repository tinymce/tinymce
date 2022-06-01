import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { copyCols } from 'ephox/snooker/api/CopyCols';

describe('CopyColumnsTest', () => {
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

    const rowsOpt = copyCols(table, {
      selection: [ Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie(label + ': could not follow path') ]
    });
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

  it('TBA: Test copying column from basic table', () =>
    check(
      'Test copying column from basic table',
      defaultTable(),
      (
        '<tr><td scope="col">H2</td></tr>' +
        '<tr><td>B2</td></tr>' +
        '<tr><td>B3</td></tr>' +
        '<tr><td>F2</td></tr>'
      ),
      0, 0, 1
    ));

  it('TBA: Test copying column from rowspan table', () =>
    check(
      'Test copying column from rowspan table',
      rowspanTable(),
      (
        '<tr><td>H1</td></tr>' +
        '<tr><td rowspan="2">A2</td></tr>' +
        '<tr></tr>' +
        '<tr><td>F1</td></tr>'
      ),
      1, 0, 0
    ));

  it('TBA: Test copying column from colspan table with selection in colspan cell', () =>
    check(
      'Test copying column from colspan table with selection in colspan cell',
      colspanTable(),
      (
        '<tr><td>H1</td><td>H2</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '<tr><td colspan="2">A3</td></tr>' +
        '<tr><td colspan="2">A4</td></tr>' +
        '<tr><td>F1</td><td>F2</td></tr>'
      ),
      1, 1, 0
    ));

  it('TBA: Test copying column from colspan table with selection not in colspan cell', () =>
    check(
      'Test copying column from colspan table with selection not in colspan cell',
      colspanTable(),
      (
        '<tr><td>H1</td></tr>' +
        '<tr><td>A2</td></tr>' +
        '<tr><td>A3</td></tr>' +
        '<tr><td>A4</td></tr>' +
        '<tr><td>F1</td></tr>'
      ),
      1, 0, 0
    ));

  it('TINY-8040: Test copying column from colspan table with selection in colspan cell', () =>
    check(
      'Test copying column from colspan table with selection in colspan cell',
      colspanTable(),
      (
        '<tr><td>H2</td></tr>' +
        '<tr><td>B2</td></tr>' +
        '<tr><td>A3</td></tr>' +
        '<tr><td>A4</td></tr>' +
        '<tr><td>F2</td></tr>'
      ),
      1, 0, 1
    ));

  it('TBA: Test copying column from colgroup table', () =>
    check(
      'Test copying column from colgroup table',
      defaultTable(true),
      (
        '<colgroup><col></colgroup>' +
        '<tr><td scope="col">H2</td></tr>' +
        '<tr><td>B2</td></tr>' +
        '<tr><td>B3</td></tr>' +
        '<tr><td>F2</td></tr>'
      ),
      2, 0, 1
    ));

  it('TBA: Test copying column from colgroup table with locked column - selection not in locked column', () =>
    check(
      'Test copying column from colgroup table with locked column - selection not in locked column',
      defaultTable(true, [ 1 ]),
      (
        '<colgroup><col></colgroup>' +
        '<tr><td scope="col">H1</td></tr>' +
        '<tr><td>A2</td></tr>' +
        '<tr><td>A3</td></tr>' +
        '<tr><td>F1</td></tr>'
      ),
      2, 0, 0
    ));

  it('TBA: Test copying column from colgroup table with locked column - selection in locked column (0)', () =>
    check(
      'Test copying column from colgroup table with locked column - selection in locked column (0)',
      defaultTable(true, [ 0 ]),
      '',
      2, 0, 0
    ));

  it('TBA: Test copying column from colgroup table with locked column - selection in locked column (1)', () =>
    check(
      'Test copying column from colgroup table with locked column - selection in locked column (1)',
      defaultTable(true, [ 1 ]),
      '',
      2, 0, 1
    ));

  it('TBA: Test copying column from colgroup table with multiple locked columns', () =>
    check(
      'Test copying column from colgroup table with multiple locked columns',
      defaultTable(true, [ 0, 1 ]),
      '',
      2, 1, 1
    ));
});
