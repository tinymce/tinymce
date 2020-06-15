import { Assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLTableElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Body, Element, Hierarchy, Html, Insert, Remove } from '@ephox/sugar';
import { copyRows } from 'ephox/snooker/api/CopyRows';
import * as Bridge from 'ephox/snooker/test/Bridge';

UnitTest.test('CopyColumnsTest', () => {
  const check = (
    inputHtml: string,
    expectedHtml: string,
    section: number,
    row: number,
    column: number
  ) => {
    const table = Element.fromHtml<HTMLTableElement>(inputHtml);
    Insert.append(Body.body(), table);

    const rows = copyRows(table, {
      selection: Fun.constant([ Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie() ])
    }, Bridge.generators).getOrDie();
    const copiedHtml = Arr.map(rows, Html.getOuter).join('');

    Assert.eq('Copied HTML should match', expectedHtml, copiedHtml);
    Remove.remove(table);
  };

  check(
    (
      '<table>' +
      '<thead>' +
      '<tr><td>H1</td><td>H2</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>A3</td><td>B3</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
      '<tr><td>F1</td><td>F2</td></tr>' +
      '</tfoot>' +
      '</table>'
    ),
    '<tr><td>H1</td><td>H2</td></tr>',
    0, 0, 0
  );

  check(
    (
      '<table>' +
      '<thead>' +
      '<tr><td>H1</td><td>H2</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td>A3</td><td>B3</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
      '<tr><td>F1</td><td>F2</td></tr>' +
      '</tfoot>' +
      '</table>'
    ),
    '<tr><td>F1</td><td>F2</td></tr>',
    2, 0, 1
  );

  check(
    (
      '<table>' +
      '<thead>' +
      '<tr><td>H1</td><td>H2</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A2</td><td>B2</td></tr>' +
      '<tr><td colspan="2">A3</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
      '<tr><td>F1</td><td>F2</td></tr>' +
      '</tfoot>' +
      '</table>'
    ),
    '<tr><td colspan="2">A3</td></tr>',
    1, 1, 0
  );

  check(
    (
      '<table>' +
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
      '</table>'
    ),
    (
      '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
      '<tr><td>B3</td></tr>'
    ),
    1, 0, 0
  );

  check(
    (
      '<table>' +
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
      '</table>'
    ),
    '<tr><td>A2</td><td>B3</td></tr>',
    1, 1, 0
  );
});
