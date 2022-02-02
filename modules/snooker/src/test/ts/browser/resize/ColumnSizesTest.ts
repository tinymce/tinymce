import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { TableSize } from 'ephox/snooker/api/TableSize';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as BarPositions from 'ephox/snooker/resize/BarPositions';
import * as ColumnSizes from 'ephox/snooker/resize/ColumnSizes';

const noneTableHtml = '<table><tbody><tr><td>A</td><td>A</td></tr></tbody></table>';
const pixelTableHtml = '<table style="width: 400px; border-collapse: collapse"><tbody><tr><td style="width: 200px;">A</td><td style="width: 200px;">A</td></tr></tbody></table>';
const percentTableHtml = '<table style="width: 80%; border-collapse: collapse"><tbody><tr><td style="width: 50%;">A</td><td style="width: 50%;">A</td></tr></tbody></table>';
const pixelTableMissingWidthsHtml = `<table style="width: 400px; border-collapse: collapse">
  <tbody>
    <tr><td>A</td><td style="width: 200px;">B</td></tr>
    <tr><td style="width: 200px;">C</td><td>D</td></tr>
  </tbody>
</table>`;
const tableWithSpansHtml = '<table style="width: 400px; border-collapse: collapse"><tbody><tr><td style="width: 400px;" colspan="2">A</td></tr></tbody></table>';
const noneTableWithColsHtml = '<table><colgroup><col><col></colgroup><tbody><tr><td>A</td><td>A</td></tr></tbody></table>';

UnitTest.test('ColumnSizes.getPixelWidths', () => {
  const sTest = (label: string, html: string, getExpectedWidths: (cellWidth: number) => number[]) => {
    const container = SugarElement.fromHtml<HTMLDivElement>('<div style="width: 500px;"></div>');
    const table = SugarElement.fromHtml<HTMLTableElement>(html);
    Insert.append(container, table);
    Insert.append(SugarBody.body(), container);

    const cellWidth = SelectorFind.descendant<HTMLTableCellElement>(table, 'td')
      .map((cell) => Math.round(parseFloat(Css.get(cell, 'width'))))
      .getOrDie();

    const pixelWidths = ColumnSizes.getPixelWidths(Warehouse.fromTable(table), table, TableSize.getTableSize(table));

    // Round to account for precision issues
    const roundedPixelWidths = Arr.map(pixelWidths, Math.round);
    Assert.eq(label, getExpectedWidths(cellWidth), roundedPixelWidths);

    Remove.remove(container);
  };

  sTest('Pixel Table - Column widths should be the raw size of the cell', pixelTableHtml, () => [ 198, 198 ]);
  sTest('Percent Table - Column widths should be the raw size of the cell', percentTableHtml, () => [ 198, 198 ]);
  sTest('Pixel Table - Column widths with missing widths on some cells should be the raw size of the cell', pixelTableMissingWidthsHtml, () => [ 198, 198 ]);
  sTest('Pixel Table - Column width should be the size of the table when using colspans', tableWithSpansHtml, () => [ 0, 400 ]);
  sTest('None Table - Column widths should be the computed size of the cell', noneTableHtml, (width) => [ width, width ]);
  sTest('None Table - Column widths for cols should be the computed size of the cell', noneTableWithColsHtml, (width) => [ width + 2, width + 2 ]); // Add 2 to account for the borders
});

UnitTest.test('ColumnSizes.getPercentageWidths', () => {
  const sTest = (label: string, html: string, expectedWidths: number[]) => {
    const container = SugarElement.fromHtml<HTMLDivElement>('<div style="width: 500px;"></div>');
    const table = SugarElement.fromHtml<HTMLTableElement>(html);
    Insert.append(container, table);
    Insert.append(SugarBody.body(), container);

    const percentWidths = ColumnSizes.getPercentageWidths(Warehouse.fromTable(table), table, TableSize.getTableSize(table));

    // Round to account for precision issues
    const roundedPercentWidths = Arr.map(percentWidths, (width) => parseFloat(width.toFixed(1)));
    Assert.eq(label, expectedWidths, roundedPercentWidths);

    Remove.remove(container);
  };

  sTest('Pixel Table - Column widths should be the raw size of the cell', pixelTableHtml, [ 50, 50 ]);
  sTest('Percent Table - Column widths should be the raw size of the cell', percentTableHtml, [ 50, 50 ]);
  sTest('Pixel Table - Column widths with missing widths on some cells should be the raw size of the cell', pixelTableMissingWidthsHtml, [ 50, 50 ]);
  sTest('Pixel Table - Column width should be the size of the table when using colspans', tableWithSpansHtml, [ 0, 100 ]);
});

UnitTest.test('ColumnSizes.getPixelHeights', () => {
  const table = SugarElement.fromHtml<HTMLTableElement>(noneTableHtml);
  Insert.append(SugarBody.body(), table);

  const cellHeight = SelectorFind.descendant<HTMLTableCellElement>(table, 'td')
    .map((cell) => Math.round(parseFloat(Css.get(cell, 'height'))))
    .getOrDie();

  const pixelHeights = ColumnSizes.getPixelHeights(Warehouse.fromTable(table), table, BarPositions.height);

  // Round to account for precision issues
  const roundedPixelHeights = Arr.map(pixelHeights, Math.round);
  Assert.eq('Row heights should be the computed size of the cell', [ cellHeight ], roundedPixelHeights);

  Remove.remove(table);
});
