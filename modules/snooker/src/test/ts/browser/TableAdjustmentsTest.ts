import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { TableSize } from 'ephox/snooker/api/TableSize';
import * as Adjustments from 'ephox/snooker/resize/Adjustments';

UnitTest.test('TableAdjustmentsTest', () => {
  const preserveTable = ResizeBehaviour.preserveTable();
  const resizeTable = ResizeBehaviour.resizeTable();

  const boundBox = '<div style="width: 800px; height: 600px; display: block;"></div>';
  const box = SugarElement.fromHtml<HTMLDivElement>(boundBox);
  Insert.append(SugarBody.body(), box);

  const relativeTable = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 50%;" border="1">
  <tbody>
  <tr>
  <td style="width: 25%;">a</td>
  <td style="width: 25%;">b</td>
  <td style="width: 25%;">c</td>
  <td style="width: 25%;">d</td>
  </tr>
  <tr>
  <td style="width: 25%;">e</td>
  <td style="width: 25%;">f</td>
  <td style="width: 25%;">g</td>
  <td style="width: 25%;">h</td>
  </tr>
  </tbody>
  </table>`);

  const relativeTableWithColGroup = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 50%;" border="1">
  <colgroup>
  <col style="width: 25%;">
  <col style="width: 25%;">
  <col style="width: 25%;">
  <col style="width: 25%;">
  </colgroup>
  <tbody>
  <tr>
  <td>a</td>
  <td>b</td>
  <td>c</td>
  <td>d</td>
  </tr>
  <tr>
  <td>e</td>
  <td>f</td>
  <td>g</td>
  <td>h</td>
  </tr>
  </tbody>
  </table>`);

  const pixelTable = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 400px;" border="1">
  <tbody>
  <tr>
  <td style="width: 96.75px;">a</td>
  <td style="width: 96.75px;">b</td>
  <td style="width: 96.75px;">c</td>
  <td style="width: 96.75px;">d</td>
  </tr>
  <tr>
  <td style="width: 96.75px;">e</td>
  <td style="width: 96.75px;">f</td>
  <td style="width: 96.75px;">g</td>
  <td style="width: 96.75px;">h</td>
  </tr>
  </tbody>
  </table>`);

  const pixelTableWithColGroup = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 400px;" border="1">
  <colgroup>
  <col style="width: 100px;">
  <col style="width: 100px;">
  <col style="width: 100px;">
  <col style="width: 100px;">
  </colgroup>
  <tbody>
  <tr>
  <td>a</td>
  <td>b</td>
  <td>c</td>
  <td>d</td>
  </tr>
  <tr>
  <td>e</td>
  <td>f</td>
  <td>g</td>
  <td>h</td>
  </tr>
  </tbody>
  </table>`);

  const percentageToStep = (percentage: number, width: number) => percentage / 100 * width;
  // Note: Will not work for tables with colspans or rowspans
  const getColumnWidths = (table: SugarElement<HTMLTableElement>, useColumns: boolean) => {
    const row: ArrayLike<Node> = useColumns ? table.dom.getElementsByTagName('col') : table.dom.rows[0].cells;
    return Arr.map(row, (cell) =>
      parseFloat(Css.getRaw(SugarElement.fromDom(cell), 'width').getOr('0')));
  };

  const testAdjustWidth = (msg: string, expectedWidth: number, expectedColumnWidths: number[], table: SugarElement<HTMLTableElement>, step: number, index: number, columnSizing: ResizeBehaviour.ResizeBehaviour, useColumn: boolean) => {
    Insert.append(box, table);
    Adjustments.adjustWidth(table, step, index, columnSizing, TableSize.getTableSize(table));

    const actualTableWidth = parseFloat(Css.getRaw(table, 'width').getOrDie());
    assert.eq(actualTableWidth, expectedWidth, `${msg} - table widths should match: expected: ${expectedWidth}, actual: ${actualTableWidth}`);

    const widths = getColumnWidths(table, useColumn);
    const widthDiffsPercentages = Arr.map(expectedColumnWidths, (expectedWidth, index) => (widths[index] - expectedWidth) / widths[index] * 100);
    // Verify that the difference is less than 1% to allow for minor floating point differences
    Arr.each(widthDiffsPercentages, (x) => {
      assert.eq(true, Math.abs(x) < 1, `${msg} - columns widths should match: expected: ${expectedColumnWidths}, actual: ${widths}`);
    });

    Remove.remove(table);
  };

  const testInnerColumnResizing = () => {
    // 'preserveTable' column resizing
    testAdjustWidth(`ltr step (%) - preserveTable (0-0)`, 50, [ 37.5, 12.5, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 0, preserveTable, false);
    testAdjustWidth(`ltr step (%) - preserveTable (0-1)`, 50, [ 37.5, 12.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 0, preserveTable, true);
    testAdjustWidth(`ltr step (%) - preserveTable (1-0)`, 50, [ 25, 37.5, 12.5, 25 ], relativeTable(), percentageToStep(12.5, 400), 1, preserveTable, false);
    testAdjustWidth(`ltr step (%) - preserveTable (1-1)`, 50, [ 25, 37.5, 12.5, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 1, preserveTable, true);
    testAdjustWidth(`ltr step (%) - preserveTable (2-0)`, 50, [ 25, 25, 37.5, 12.5 ], relativeTable(), percentageToStep(12.5, 400), 2, preserveTable, false);
    testAdjustWidth(`ltr step (%) - preserveTable (2-1)`, 50, [ 25, 25, 37.5, 12.5 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 2, preserveTable, true);
    testAdjustWidth(`ltr large step (%) - preserveTable (0-0)`, 50, [ 47.5, 2.5, 25, 25 ], relativeTable(), percentageToStep(50, 400), 0, preserveTable, false);
    testAdjustWidth(`ltr large step (%) - preserveTable (0-1)`, 50, [ 47.5, 2.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 0, preserveTable, true);
    testAdjustWidth(`ltr large step (%) - preserveTable (1-0)`, 50, [ 25, 47.5, 2.5, 25 ], relativeTable(), percentageToStep(50, 400), 1, preserveTable, false);
    testAdjustWidth(`ltr large step (%) - preserveTable (1-1)`, 50, [ 25, 47.5, 2.5, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 1, preserveTable, true);
    testAdjustWidth(`ltr large step (%) - preserveTable (2-0)`, 50, [ 25, 25, 47.5, 2.5 ], relativeTable(), percentageToStep(50, 400), 2, preserveTable, false);
    testAdjustWidth(`ltr large step (%) - preserveTable (2-1)`, 50, [ 25, 25, 47.5, 2.5 ], relativeTableWithColGroup(), percentageToStep(50, 400), 2, preserveTable, true);
    testAdjustWidth(`rtl step (%) - preserveTable (0-0)`, 50, [ 12.5, 37.5, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 0, preserveTable, false);
    testAdjustWidth(`rtl step (%) - preserveTable (0-1)`, 50, [ 12.5, 37.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 0, preserveTable, true);
    testAdjustWidth(`rtl step (%) - preserveTable (1-0)`, 50, [ 25, 12.5, 37.5, 25 ], relativeTable(), percentageToStep(-12.5, 400), 1, preserveTable, false);
    testAdjustWidth(`rtl step (%) - preserveTable (1-1)`, 50, [ 25, 12.5, 37.5, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 1, preserveTable, true);
    testAdjustWidth(`rtl step (%) - preserveTable (2-0)`, 50, [ 25, 25, 12.5, 37.5 ], relativeTable(), percentageToStep(-12.5, 400), 2, preserveTable, false);
    testAdjustWidth(`rtl step (%) - preserveTable (2-1)`, 50, [ 25, 25, 12.5, 37.5 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 2, preserveTable, true);
    testAdjustWidth(`rtl large step (%) - preserveTable (0-0)`, 50, [ 2.5, 47.5, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 0, preserveTable, false);
    testAdjustWidth(`rtl large step (%) - preserveTable (0-1)`, 50, [ 2.5, 47.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 0, preserveTable, true);
    testAdjustWidth(`rtl large step (%) - preserveTable (1-0)`, 50, [ 25, 2.5, 47.5, 25 ], relativeTable(), percentageToStep(-50, 400), 1, preserveTable, false);
    testAdjustWidth(`rtl large step (%) - preserveTable (1-1)`, 50, [ 25, 2.5, 47.5, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 1, preserveTable, true);
    testAdjustWidth(`rtl large step (%) - preserveTable (2-0)`, 50, [ 25, 25, 2.5, 47.5 ], relativeTable(), percentageToStep(-50, 400), 2, preserveTable, false);
    testAdjustWidth(`rtl large step (%) - preserveTable (2-1)`, 50, [ 25, 25, 2.5, 47.5 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 2, preserveTable, true);
    testAdjustWidth(`ltr step (px) - preserveTable (0-0)`, 400, [ 146, 46, 96, 96 ], pixelTable(), 50, 0, preserveTable, false);
    testAdjustWidth(`ltr step (px) - preserveTable (0-1)`, 400, [ 150, 50, 100, 100 ], pixelTableWithColGroup(), 50, 0, preserveTable, true);
    testAdjustWidth(`ltr step (px) - preserveTable (1-0)`, 400, [ 96, 146, 46, 96 ], pixelTable(), 50, 1, preserveTable, false);
    testAdjustWidth(`ltr step (px) - preserveTable (1-1)`, 400, [ 100, 150, 50, 100 ], pixelTableWithColGroup(), 50, 1, preserveTable, true);
    testAdjustWidth(`ltr step (px) - preserveTable (2-0)`, 400, [ 96, 96, 146, 46 ], pixelTable(), 50, 2, preserveTable, false);
    testAdjustWidth(`ltr step (px) - preserveTable (2-1)`, 400, [ 100, 100, 150, 50 ], pixelTableWithColGroup(), 50, 2, preserveTable, true);
    testAdjustWidth(`ltr large step (px) - preserveTable (0-0)`, 400, [ 182, 10, 96, 96 ], pixelTable(), 200, 0, preserveTable, false);
    testAdjustWidth(`ltr large step (px) - preserveTable (0-1)`, 400, [ 190, 10, 100, 100 ], pixelTableWithColGroup(), 200, 0, preserveTable, true);
    testAdjustWidth(`ltr large step (px) - preserveTable (1-0)`, 400, [ 96, 182, 10, 96 ], pixelTable(), 200, 1, preserveTable, false);
    testAdjustWidth(`ltr large step (px) - preserveTable (1-1)`, 400, [ 100, 190, 10, 100 ], pixelTableWithColGroup(), 200, 1, preserveTable, true);
    testAdjustWidth(`ltr large step (px) - preserveTable (2-0)`, 400, [ 96, 96, 182, 10 ], pixelTable(), 200, 2, preserveTable, false);
    testAdjustWidth(`ltr large step (px) - preserveTable (2-1)`, 400, [ 100, 100, 190, 10 ], pixelTableWithColGroup(), 200, 2, preserveTable, true);
    testAdjustWidth(`rtl step (px) - preserveTable (0-0)`, 400, [ 46, 146, 96, 96 ], pixelTable(), -50, 0, preserveTable, false);
    testAdjustWidth(`rtl step (px) - preserveTable (0-1)`, 400, [ 50, 150, 100, 100 ], pixelTableWithColGroup(), -50, 0, preserveTable, true);
    testAdjustWidth(`rtl step (px) - preserveTable (1-0)`, 400, [ 96, 46, 146, 96 ], pixelTable(), -50, 1, preserveTable, false);
    testAdjustWidth(`rtl step (px) - preserveTable (1-1)`, 400, [ 100, 50, 150, 100 ], pixelTableWithColGroup(), -50, 1, preserveTable, true);
    testAdjustWidth(`rtl step (px) - preserveTable (2-0)`, 400, [ 96, 96, 46, 146 ], pixelTable(), -50, 2, preserveTable, false);
    testAdjustWidth(`rtl step (px) - preserveTable (2-1)`, 400, [ 100, 100, 50, 150 ], pixelTableWithColGroup(), -50, 2, preserveTable, true);
    testAdjustWidth(`rtl large step (px) - preserveTable (0-0)`, 400, [ 10, 182, 96, 96 ], pixelTable(), -200, 0, preserveTable, false);
    testAdjustWidth(`rtl large step (px) - preserveTable (0-1)`, 400, [ 10, 190, 100, 100 ], pixelTableWithColGroup(), -200, 0, preserveTable, true);
    testAdjustWidth(`rtl large step (px) - preserveTable (1-0)`, 400, [ 96, 10, 182, 96 ], pixelTable(), -200, 1, preserveTable, false);
    testAdjustWidth(`rtl large step (px) - preserveTable (1-1)`, 400, [ 100, 10, 190, 100 ], pixelTableWithColGroup(), -200, 1, preserveTable, true);
    testAdjustWidth(`rtl large step (px) - preserveTable (2-0)`, 400, [ 96, 96, 10, 182 ], pixelTable(), -200, 2, preserveTable, false);
    testAdjustWidth(`rtl large step (px) - preserveTable (2-1)`, 400, [ 100, 100, 10, 190 ], pixelTableWithColGroup(), -200, 2, preserveTable, true);

    // 'resizeTable' column resizing
    testAdjustWidth(`ltr step (%) - resizeTable (0-0)`, 56.25, [ 33.33, 22.22, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 0, resizeTable, false);
    testAdjustWidth(`ltr step (%) - resizeTable (0-1)`, 56.25, [ 33.33, 22.22, 22.22, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 0, resizeTable, true);
    testAdjustWidth(`ltr step (%) - resizeTable (1-0)`, 56.25, [ 22.22, 33.33, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 1, resizeTable, false);
    testAdjustWidth(`ltr step (%) - resizeTable (1-1)`, 56.25, [ 22.22, 33.33, 22.22, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 1, resizeTable, true);
    testAdjustWidth(`ltr step (%) - resizeTable (2-0)`, 56.25, [ 22.22, 22.22, 33.33, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 2, resizeTable, false);
    testAdjustWidth(`ltr step (%) - resizeTable (2-1)`, 56.25, [ 22.22, 22.22, 33.33, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 2, resizeTable, true);
    testAdjustWidth(`ltr large step (%) - resizeTable (0-0)`, 75, [ 50, 16.67, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 0, resizeTable, false);
    testAdjustWidth(`ltr large step (%) - resizeTable (0-1)`, 75, [ 50, 16.67, 16.67, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 0, resizeTable, true);
    testAdjustWidth(`ltr large step (%) - resizeTable (1-0)`, 75, [ 16.67, 50, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 1, resizeTable, false);
    testAdjustWidth(`ltr large step (%) - resizeTable (1-1)`, 75, [ 16.67, 50, 16.67, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 1, resizeTable, true);
    testAdjustWidth(`ltr large step (%) - resizeTable (2-0)`, 75, [ 16.67, 16.67, 50, 16.67 ], relativeTable(), percentageToStep(50, 400), 2, resizeTable, false);
    testAdjustWidth(`ltr large step (%) - resizeTable (2-1)`, 75, [ 16.67, 16.67, 50, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 2, resizeTable, true);
    testAdjustWidth(`rtl step (%) - resizeTable (0-0)`, 43.75, [ 14.29, 28.57, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 0, resizeTable, false);
    testAdjustWidth(`rtl step (%) - resizeTable (0-1)`, 43.75, [ 14.29, 28.57, 28.57, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 0, resizeTable, true);
    testAdjustWidth(`rtl step (%) - resizeTable (1-0)`, 43.75, [ 28.57, 14.29, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 1, resizeTable, false);
    testAdjustWidth(`rtl step (%) - resizeTable (1-1)`, 43.75, [ 28.57, 14.29, 28.57, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 1, resizeTable, true);
    testAdjustWidth(`rtl step (%) - resizeTable (2-0)`, 43.75, [ 28.57, 28.57, 14.29, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 2, resizeTable, false);
    testAdjustWidth(`rtl step (%) - resizeTable (2-1)`, 43.75, [ 28.57, 28.57, 14.29, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 2, resizeTable, true);
    testAdjustWidth(`rtl large step (%) - resizeTable (0-0)`, 38.75, [ 3.23, 32.26, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 0, resizeTable, false);
    testAdjustWidth(`rtl large step (%) - resizeTable (0-1)`, 38.75, [ 3.23, 32.26, 32.26, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 0, resizeTable, true);
    testAdjustWidth(`rtl large step (%) - resizeTable (1-0)`, 38.75, [ 32.26, 3.23, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 1, resizeTable, false);
    testAdjustWidth(`rtl large step (%) - resizeTable (1-1)`, 38.75, [ 32.26, 3.23, 32.26, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 1, resizeTable, true);
    testAdjustWidth(`rtl large step (%) - resizeTable (2-0)`, 38.75, [ 32.26, 32.26, 3.23, 32.26 ], relativeTable(), percentageToStep(-50, 400), 2, resizeTable, false);
    testAdjustWidth(`rtl large step (%) - resizeTable (2-1)`, 38.75, [ 32.26, 32.26, 3.23, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 2, resizeTable, true);
    testAdjustWidth(`ltr step (px) - resizeTable (0-0)`, 450, [ 146, 96, 96, 96 ], pixelTable(), 50, 0, resizeTable, false);
    testAdjustWidth(`ltr step (px) - resizeTable (0-1)`, 450, [ 150, 100, 100, 100 ], pixelTableWithColGroup(), 50, 0, resizeTable, true);
    testAdjustWidth(`ltr step (px) - resizeTable (1-0)`, 450, [ 96, 146, 96, 96 ], pixelTable(), 50, 1, resizeTable, false);
    testAdjustWidth(`ltr step (px) - resizeTable (1-1)`, 450, [ 100, 150, 100, 100 ], pixelTableWithColGroup(), 50, 1, resizeTable, true);
    testAdjustWidth(`ltr step (px) - resizeTable (2-0)`, 450, [ 96, 96, 146, 96 ], pixelTable(), 50, 2, resizeTable, false);
    testAdjustWidth(`ltr step (px) - resizeTable (2-1)`, 450, [ 100, 100, 150, 100 ], pixelTableWithColGroup(), 50, 2, resizeTable, true);
    testAdjustWidth(`ltr large step (px) - resizeTable (0-0)`, 600, [ 296, 96, 96, 96 ], pixelTable(), 200, 0, resizeTable, false);
    testAdjustWidth(`ltr large step (px) - resizeTable (0-1)`, 600, [ 300, 100, 100, 100 ], pixelTableWithColGroup(), 200, 0, resizeTable, true);
    testAdjustWidth(`ltr large step (px) - resizeTable (1-0)`, 600, [ 96, 296, 96, 96 ], pixelTable(), 200, 1, resizeTable, false);
    testAdjustWidth(`ltr large step (px) - resizeTable (1-1)`, 600, [ 100, 300, 100, 100 ], pixelTableWithColGroup(), 200, 1, resizeTable, true);
    testAdjustWidth(`ltr large step (px) - resizeTable (2-0)`, 600, [ 96, 96, 296, 96 ], pixelTable(), 200, 2, resizeTable, false);
    testAdjustWidth(`ltr large step (px) - resizeTable (2-1)`, 600, [ 100, 100, 300, 100 ], pixelTableWithColGroup(), 200, 2, resizeTable, true);
    testAdjustWidth(`rtl step (px) - resizeTable (0-0)`, 350, [ 46, 96, 96, 96 ], pixelTable(), -50, 0, resizeTable, false);
    testAdjustWidth(`rtl step (px) - resizeTable (0-1)`, 350, [ 50, 100, 100, 100 ], pixelTableWithColGroup(), -50, 0, resizeTable, true);
    testAdjustWidth(`rtl step (px) - resizeTable (1-0)`, 350, [ 96, 46, 96, 96 ], pixelTable(), -50, 1, resizeTable, false);
    testAdjustWidth(`rtl step (px) - resizeTable (1-1)`, 350, [ 100, 50, 100, 100 ], pixelTableWithColGroup(), -50, 1, resizeTable, true);
    testAdjustWidth(`rtl step (px) - resizeTable (2-0)`, 350, [ 96, 96, 46, 96 ], pixelTable(), -50, 2, resizeTable, false);
    testAdjustWidth(`rtl step (px) - resizeTable (2-1)`, 350, [ 100, 100, 50, 100 ], pixelTableWithColGroup(), -50, 2, resizeTable, true);
    testAdjustWidth(`rtl large step (px) - resizeTable (0-0)`, 314, [ 10, 96, 96, 96 ], pixelTable(), -200, 0, resizeTable, false);
    testAdjustWidth(`rtl large step (px) - resizeTable (0-1)`, 310, [ 10, 100, 100, 100 ], pixelTableWithColGroup(), -200, 0, resizeTable, true);
    testAdjustWidth(`rtl large step (px) - resizeTable (1-0)`, 314, [ 96, 10, 96, 96 ], pixelTable(), -200, 1, resizeTable, false);
    testAdjustWidth(`rtl large step (px) - resizeTable (1-1)`, 310, [ 100, 10, 100, 100 ], pixelTableWithColGroup(), -200, 1, resizeTable, true);
    testAdjustWidth(`rtl large step (px) - resizeTable (2-0)`, 314, [ 96, 96, 10, 96 ], pixelTable(), -200, 2, resizeTable, false);
    testAdjustWidth(`rtl large step (px) - resizeTable (2-1)`, 310, [ 100, 100, 10, 100 ], pixelTableWithColGroup(), -200, 2, resizeTable, true);
  };

  const testLastColumnResizing = () => {
    // 'resizeTable' column resizing
    testAdjustWidth(`ltr step (%) - resizeTable (3)`, 56.25, [ 22.22, 22.22, 22.22, 33.33 ], relativeTable(), percentageToStep(12.5, 400), 3, resizeTable, false);
    testAdjustWidth(`ltr step (%) - resizeTable (3)`, 56.25, [ 22.22, 22.22, 22.22, 33.33 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 3, resizeTable, true);
    testAdjustWidth(`ltr large step (%) - resizeTable (3)`, 75, [ 16.67, 16.67, 16.67, 50 ], relativeTable(), percentageToStep(50, 400), 3, resizeTable, false);
    testAdjustWidth(`ltr large step (%) - resizeTable (3)`, 75, [ 16.67, 16.67, 16.67, 50 ], relativeTableWithColGroup(), percentageToStep(50, 400), 3, resizeTable, true);
    testAdjustWidth(`rtl step (%) - resizeTable (3)`, 43.75, [ 28.57, 28.57, 28.57, 14.29 ], relativeTable(), percentageToStep(-12.5, 400), 3, resizeTable, false);
    testAdjustWidth(`rtl step (%) - resizeTable (3)`, 43.75, [ 28.57, 28.57, 28.57, 14.29 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 3, resizeTable, true);
    testAdjustWidth(`rtl large step (%) - resizeTable (3)`, 38.75, [ 32.26, 32.26, 32.26, 3.23 ], relativeTable(), percentageToStep(-50, 400), 3, resizeTable, false);
    testAdjustWidth(`rtl large step (%) - resizeTable (3)`, 38.75, [ 32.26, 32.26, 32.26, 3.23 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 3, resizeTable, true);
    testAdjustWidth(`ltr step (px) - resizeTable (3)`, 450, [ 96, 96, 96, 146 ], pixelTable(), 50, 3, resizeTable, false);
    testAdjustWidth(`ltr step (px) - resizeTable (3)`, 450, [ 100, 100, 100, 150 ], pixelTableWithColGroup(), 50, 3, resizeTable, true);
    testAdjustWidth(`ltr large step (px) - resizeTable (3)`, 600, [ 96, 96, 96, 296 ], pixelTable(), 200, 3, resizeTable, false);
    testAdjustWidth(`ltr large step (px) - resizeTable (3)`, 600, [ 100, 100, 100, 300 ], pixelTableWithColGroup(), 200, 3, resizeTable, true);
    testAdjustWidth(`rtl step (px) - resizeTable (3)`, 350, [ 96, 96, 96, 46 ], pixelTable(), -50, 3, resizeTable, false);
    testAdjustWidth(`rtl step (px) - resizeTable (3)`, 350, [ 100, 100, 100, 50 ], pixelTableWithColGroup(), -50, 3, resizeTable, true);
    testAdjustWidth(`rtl large step (px) - resizeTable (3)`, 314, [ 96, 96, 96, 10 ], pixelTable(), -200, 3, resizeTable, false);
    testAdjustWidth(`rtl large step (px) - resizeTable (3)`, 310, [ 100, 100, 100, 10 ], pixelTableWithColGroup(), -200, 3, resizeTable, true);

    // 'preserveTable' column resizing
    testAdjustWidth(`ltr step (%) - preserveTable (3)`, 56.25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 3, preserveTable, false);
    testAdjustWidth(`ltr step (%) - preserveTable (3)`, 56.25, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 3, preserveTable, true);
    testAdjustWidth(`ltr large step (%) - preserveTable (3)`, 75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(50, 400), 3, preserveTable, false);
    testAdjustWidth(`ltr large step (%) - preserveTable (3)`, 75, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 3, preserveTable, true);
    testAdjustWidth(`rtl step (%) - preserveTable (3)`, 43.75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 3, preserveTable, false);
    testAdjustWidth(`rtl step (%) - preserveTable (3)`, 43.75, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 3, preserveTable, true);
    testAdjustWidth(`rtl large step (%) - preserveTable (3)`, 25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 3, preserveTable, false);
    testAdjustWidth(`rtl large step (%) - preserveTable (3)`, 25, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 3, preserveTable, true);
    testAdjustWidth(`ltr step (px) - preserveTable (3)`, 450, [ 108, 108, 108, 108 ], pixelTable(), 50, 3, preserveTable, false);
    testAdjustWidth(`ltr step (px) - preserveTable (3)`, 450, [ 112.5, 112.5, 112.5, 112.5 ], pixelTableWithColGroup(), 50, 3, preserveTable, true);
    testAdjustWidth(`ltr large step (px) - preserveTable (3)`, 600, [ 146, 146, 146, 146 ], pixelTable(), 200, 3, preserveTable, false);
    testAdjustWidth(`ltr large step (px) - preserveTable (3)`, 600, [ 150, 150, 150, 150 ], pixelTableWithColGroup(), 200, 3, preserveTable, true);
    testAdjustWidth(`rtl step (px) - preserveTable (3)`, 350, [ 83, 83, 83, 83 ], pixelTable(), -50, 3, preserveTable, false);
    testAdjustWidth(`rtl step (px) - preserveTable (3)`, 350, [ 87.5, 87.5, 87.5, 87.5 ], pixelTableWithColGroup(), -50, 3, preserveTable, true);
    testAdjustWidth(`rtl large step (px) - preserveTable (3)`, 200, [ 46, 46, 46, 46 ], pixelTable(), -200, 3, preserveTable, false);
    testAdjustWidth(`rtl large step (px) - preserveTable (3)`, 200, [ 50, 50, 50, 50 ], pixelTableWithColGroup(), -200, 3, preserveTable, true);
    testAdjustWidth(`rtl extra large step (px) - preserveTable (3)`, 56, [ 10, 10, 10, 10 ], pixelTable(), -400, 3, preserveTable, false);
    testAdjustWidth(`rtl extra large step (px) - preserveTable (3)`, 40, [ 10, 10, 10, 10 ], pixelTableWithColGroup(), -400, 3, preserveTable, true);
  };

  testInnerColumnResizing();
  testLastColumnResizing();

  Remove.remove(box);
});
