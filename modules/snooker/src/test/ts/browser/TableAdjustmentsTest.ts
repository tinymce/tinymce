import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { ResizeDirection } from 'ephox/snooker/api/ResizeDirection';
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

  const percentageToStep = (percentage: number, width: number) => percentage / 100 * width;
  // Note: Will not work for tables with colspans or rowspans
  const getColumnWidths = (table: SugarElement<HTMLTableElement>) => Arr.map(table.dom().rows[0].cells, (cell) => parseFloat(Css.getRaw(SugarElement.fromDom(cell), 'width').getOr('0')));

  const testAdjustWidth = (msg: string, expectedWidth: number, expectedColumnWidths: number[], table: SugarElement<HTMLTableElement>, step: number, index: number, direction: ResizeDirection, columnSizing: ResizeBehaviour.ResizeBehaviour) => {
    Insert.append(box, table);
    Adjustments.adjustWidth(table, step, index, direction, columnSizing, TableSize.getTableSize(table));

    const actualTableWidth = parseFloat(Css.getRaw(table, 'width').getOrDie());
    assert.eq(actualTableWidth, expectedWidth, `${msg} - table widths should match: expected: ${expectedWidth}, actual: ${actualTableWidth}`);

    const widths = getColumnWidths(table);
    const widthDiffsPercentages = Arr.map(expectedColumnWidths, (x, i) => (widths[i] - x) / widths[i] * 100);
    // Verify that the difference is less than 1% to allow for minor floating point differences
    Arr.each(widthDiffsPercentages, (x) => {
      assert.eq(true, Math.abs(x) < 1, `${msg} - columns widths should match: expected: ${expectedColumnWidths}, actual: ${widths}`);
    });

    Remove.remove(table);
  };

  const testInnerColumnResizing = () => {
    // 'preserveTable' column resizing
    testAdjustWidth(`ltr step (%) - preserveTable (0)`, 50, [ 37.5, 12.5, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 0, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr step (%) - preserveTable (1)`, 50, [ 25, 37.5, 12.5, 25 ], relativeTable(), percentageToStep(12.5, 400), 1, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr step (%) - preserveTable (2)`, 50, [ 25, 25, 37.5, 12.5 ], relativeTable(), percentageToStep(12.5, 400), 2, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (%) - preserveTable (0)`, 50, [ 47.5, 2.5, 25, 25 ], relativeTable(), percentageToStep(50, 400), 0, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (%) - preserveTable (1)`, 50, [ 25, 47.5, 2.5, 25 ], relativeTable(), percentageToStep(50, 400), 1, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (%) - preserveTable (2)`, 50, [ 25, 25, 47.5, 2.5 ], relativeTable(), percentageToStep(50, 400), 2, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`rtl step (%) - preserveTable (0)`, 50, [ 12.5, 37.5, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 0, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl step (%) - preserveTable (1)`, 50, [ 25, 12.5, 37.5, 25 ], relativeTable(), percentageToStep(-12.5, 400), 1, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl step (%) - preserveTable (2)`, 50, [ 25, 25, 12.5, 37.5 ], relativeTable(), percentageToStep(-12.5, 400), 2, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (%) - preserveTable (0)`, 50, [ 2.5, 47.5, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 0, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (%) - preserveTable (1)`, 50, [ 25, 2.5, 47.5, 25 ], relativeTable(), percentageToStep(-50, 400), 1, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (%) - preserveTable (2)`, 50, [ 25, 25, 2.5, 47.5 ], relativeTable(), percentageToStep(-50, 400), 2, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`ltr step (px) - preserveTable (0)`, 400, [ 146, 46, 96, 96 ], pixelTable(), 50, 0, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr step (px) - preserveTable (1)`, 400, [ 96, 146, 46, 96 ], pixelTable(), 50, 1, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr step (px) - preserveTable (2)`, 400, [ 96, 96, 146, 46 ], pixelTable(), 50, 2, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (px) - preserveTable (0)`, 400, [ 182, 10, 96, 96 ], pixelTable(), 200, 0, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (px) - preserveTable (1)`, 400, [ 96, 182, 10, 96 ], pixelTable(), 200, 1, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (px) - preserveTable (2)`, 400, [ 96, 96, 182, 10 ], pixelTable(), 200, 2, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`rtl step (px) - preserveTable (0)`, 400, [ 46, 146, 96, 96 ], pixelTable(), -50, 0, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl step (px) - preserveTable (1)`, 400, [ 96, 46, 146, 96 ], pixelTable(), -50, 1, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl step (px) - preserveTable (2)`, 400, [ 96, 96, 46, 146 ], pixelTable(), -50, 2, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (px) - preserveTable (0)`, 400, [ 10, 182, 96, 96 ], pixelTable(), -200, 0, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (px) - preserveTable (1)`, 400, [ 96, 10, 182, 96 ], pixelTable(), -200, 1, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (px) - preserveTable (2)`, 400, [ 96, 96, 10, 182 ], pixelTable(), -200, 2, ResizeDirection.rtl, preserveTable);

    // 'resizeTable' column resizing
    testAdjustWidth(`ltr step (%) - resizeTable (0)`, 56.25, [ 33.33, 22.22, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 0, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr step (%) - resizeTable (1)`, 56.25, [ 22.22, 33.33, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 1, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr step (%) - resizeTable (2)`, 56.25, [ 22.22, 22.22, 33.33, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 2, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (%) - resizeTable (0)`, 75, [ 50, 16.67, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 0, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (%) - resizeTable (1)`, 75, [ 16.67, 50, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 1, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (%) - resizeTable (2)`, 75, [ 16.67, 16.67, 50, 16.67 ], relativeTable(), percentageToStep(50, 400), 2, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`rtl step (%) - resizeTable (0)`, 43.75, [ 14.29, 28.57, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 0, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl step (%) - resizeTable (1)`, 43.75, [ 28.57, 14.29, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 1, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl step (%) - resizeTable (2)`, 43.75, [ 28.57, 28.57, 14.29, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 2, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (%) - resizeTable (0)`, 38.75, [ 3.23, 32.26, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 0, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (%) - resizeTable (1)`, 38.75, [ 32.26, 3.23, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 1, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (%) - resizeTable (2)`, 38.75, [ 32.26, 32.26, 3.23, 32.26 ], relativeTable(), percentageToStep(-50, 400), 2, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`ltr step (px) - resizeTable (0)`, 450, [ 146, 96, 96, 96 ], pixelTable(), 50, 0, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr step (px) - resizeTable (1)`, 450, [ 96, 146, 96, 96 ], pixelTable(), 50, 1, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr step (px) - resizeTable (2)`, 450, [ 96, 96, 146, 96 ], pixelTable(), 50, 2, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (px) - resizeTable (0)`, 600, [ 296, 96, 96, 96 ], pixelTable(), 200, 0, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (px) - resizeTable (1)`, 600, [ 96, 296, 96, 96 ], pixelTable(), 200, 1, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (px) - resizeTable (2)`, 600, [ 96, 96, 296, 96 ], pixelTable(), 200, 2, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`rtl step (px) - resizeTable (0)`, 350, [ 46, 96, 96, 96 ], pixelTable(), -50, 0, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl step (px) - resizeTable (1)`, 350, [ 96, 46, 96, 96 ], pixelTable(), -50, 1, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl step (px) - resizeTable (2)`, 350, [ 96, 96, 46, 96 ], pixelTable(), -50, 2, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (px) - resizeTable (0)`, 314, [ 10, 96, 96, 96 ], pixelTable(), -200, 0, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (px) - resizeTable (1)`, 314, [ 96, 10, 96, 96 ], pixelTable(), -200, 1, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (px) - resizeTable (2)`, 314, [ 96, 96, 10, 96 ], pixelTable(), -200, 2, ResizeDirection.rtl, resizeTable);
  };

  const testLastColumnResizing = () => {
    // 'resizeTable' column resizing
    testAdjustWidth(`ltr step (%) - resizeTable (3)`, 56.25, [ 22.22, 22.22, 22.22, 33.33 ], relativeTable(), percentageToStep(12.5, 400), 3, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (%) - resizeTable (3)`, 75, [ 16.67, 16.67, 16.67, 50 ], relativeTable(), percentageToStep(50, 400), 3, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`rtl step (%) - resizeTable (3)`, 43.75, [ 28.57, 28.57, 28.57, 14.29 ], relativeTable(), percentageToStep(-12.5, 400), 3, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (%) - resizeTable (3)`, 38.75, [ 32.26, 32.26, 32.26, 3.23 ], relativeTable(), percentageToStep(-50, 400), 3, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`ltr step (px) - resizeTable (3)`, 450, [ 96, 96, 96, 146 ], pixelTable(), 50, 3, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`ltr large step (px) - resizeTable (3)`, 600, [ 96, 96, 96, 296 ], pixelTable(), 200, 3, ResizeDirection.ltr, resizeTable);
    testAdjustWidth(`rtl step (px) - resizeTable (3)`, 350, [ 96, 96, 96, 46 ], pixelTable(), -50, 3, ResizeDirection.rtl, resizeTable);
    testAdjustWidth(`rtl large step (px) - resizeTable (3)`, 314, [ 96, 96, 96, 10 ], pixelTable(), -200, 3, ResizeDirection.rtl, resizeTable);

    // 'preserveTable' column resizing
    testAdjustWidth(`ltr step (%) - preserveTable (3)`, 56.25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 3, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (%) - preserveTable (3)`, 75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(50, 400), 3, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`rtl step (%) - preserveTable (3)`, 43.75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 3, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (%) - preserveTable (3)`, 25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 3, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`ltr step (px) - preserveTable (3)`, 450, [ 108, 108, 108, 108 ], pixelTable(), 50, 3, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`ltr large step (px) - preserveTable (3)`, 600, [ 146, 146, 146, 146 ], pixelTable(), 200, 3, ResizeDirection.ltr, preserveTable);
    testAdjustWidth(`rtl step (px) - preserveTable (3)`, 350, [ 83, 83, 83, 83 ], pixelTable(), -50, 3, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl large step (px) - preserveTable (3)`, 200, [ 46, 46, 46, 46 ], pixelTable(), -200, 3, ResizeDirection.rtl, preserveTable);
    testAdjustWidth(`rtl extra large step (px) - preserveTable (3)`, 56, [ 10, 10, 10, 10 ], pixelTable(), -400, 3, ResizeDirection.rtl, preserveTable);
  };

  testInnerColumnResizing();
  testLastColumnResizing();

  Remove.remove(box);
});
