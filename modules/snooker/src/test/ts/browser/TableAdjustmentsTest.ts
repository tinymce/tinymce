import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { TableSize } from 'ephox/snooker/api/TableSize';
import * as Adjustments from 'ephox/snooker/resize/Adjustments';

describe('TableAdjustmentsTest', () => {
  const preserveTable = ResizeBehaviour.preserveTable();
  const resizeTable = ResizeBehaviour.resizeTable();

  const boundBox = '<div style="width: 800px; height: 600px; display: block;"></div>';
  const box = SugarElement.fromHtml<HTMLDivElement>(boundBox);

  before(() => {
    Insert.append(SugarBody.body(), box);
  });

  after(() => {
    Remove.remove(box);
  });

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

  const relativeTableWithOverflow = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 50%;" border="1">
  <tbody>
  <tr>
  <td style="width: 25%;"><span style="width: 120px; display: inline-block;">a</span></td>
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

  const pixelTableWithOverflow = () => SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 400px;" border="1">
  <tbody>
  <tr>
  <td style="width: 96.75px;"><span style="width: 120px; display: inline-block;">a</span></td>
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
  const getColumnWidths = (table: SugarElement<HTMLTableElement>, useColumns: boolean) => {
    const row: ArrayLike<Node> = useColumns ? table.dom.getElementsByTagName('col') : table.dom.rows[0].cells;
    return Arr.map(row, (cell) =>
      parseFloat(Css.getRaw(SugarElement.fromDom(cell), 'width').getOr('0')));
  };

  const testAdjustWidth = (expectedWidth: number, expectedColumnWidths: number[], table: SugarElement<HTMLTableElement>, step: number, index: number, columnSizing: ResizeBehaviour.ResizeBehaviour, useColumn: boolean) => () => {
    Insert.append(box, table);
    const sizing = TableSize.getTableSize(table);
    Adjustments.adjustWidth(table, step, index, columnSizing, sizing);

    const actualTableWidth = parseFloat(Css.getRaw(table, 'width').getOrDie());
    assert.approximately(actualTableWidth, expectedWidth, 0.25, `table widths should approx match: expected: ${expectedWidth}, actual: ${actualTableWidth}`);

    const widths = getColumnWidths(table, useColumn);
    // Verify that the difference is less than 0.5% to allow for minor floating point differences
    Arr.each(expectedColumnWidths, (expectedWidth, index) => {
      assert.approximately(widths[index], expectedWidth, 0.25, `columns widths should match: expected: ${expectedColumnWidths}, actual: ${widths}`);
    });

    Remove.remove(table);
  };

  context('preserve table column resizing', () => {
    context('ltr step (%)', () => {
      it('preserveTable cells (0)', testAdjustWidth(50, [ 37.5, 12.5, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(50, [ 37.5, 12.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 0, preserveTable, true));
      it('preserveTable overflow (0)', testAdjustWidth(50, [ 43.33, 10.56, 23.06, 23.06 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 0, preserveTable, false));
      it('preserveTable cells (1)', testAdjustWidth(50, [ 25, 37.5, 12.5, 25 ], relativeTable(), percentageToStep(12.5, 400), 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(50, [ 25, 37.5, 12.5, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 1, preserveTable, true));
      it('preserveTable overflow (1)', testAdjustWidth(50, [ 30.83, 35.56, 10.56, 23.06 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 1, preserveTable, false));
      it('preserveTable cells (2)', testAdjustWidth(50, [ 25, 25, 37.5, 12.5 ], relativeTable(), percentageToStep(12.5, 400), 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(50, [ 25, 25, 37.5, 12.5 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 2, preserveTable, true));
      it('preserveTable overflow (2)', testAdjustWidth(50, [ 30.83, 23.06, 35.56, 10.56 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 2, preserveTable, false));
      it('preserveTable cells (3)', testAdjustWidth(56.25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(12.5, 400), 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(56.25, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 3, preserveTable, true));
      it('preserveTable overflow (3)', testAdjustWidth(56.25, [ 30.83, 23.06, 23.06, 23.06 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 3, preserveTable, false));
    });

    context('ltr large step (%)', () => {
      it('preserveTable cells (0)', testAdjustWidth(50, [ 47.5, 2.5, 25, 25 ], relativeTable(), percentageToStep(50, 400), 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(50, [ 47.5, 2.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 0, preserveTable, true));
      it('preserveTable cells (1)', testAdjustWidth(50, [ 25, 47.5, 2.5, 25 ], relativeTable(), percentageToStep(50, 400), 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(50, [ 25, 47.5, 2.5, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 1, preserveTable, true));
      it('preserveTable cells (2)', testAdjustWidth(50, [ 25, 25, 47.5, 2.5 ], relativeTable(), percentageToStep(50, 400), 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(50, [ 25, 25, 47.5, 2.5 ], relativeTableWithColGroup(), percentageToStep(50, 400), 2, preserveTable, true));
      it('preserveTable cells (3)', testAdjustWidth(75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(50, 400), 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(75, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(50, 400), 3, preserveTable, true));
    });

    context('rtl step (%)', () => {
      it('preserveTable cells (0)', testAdjustWidth(50, [ 12.5, 37.5, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(50, [ 12.5, 37.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 0, preserveTable, true));
      // TODO: TINY-7942: This needs design input as it should be blocked since it can't be resized smaller
      it.skip('preserveTable overflow (0)', testAdjustWidth(50, [ 30.83, 23.06, 23.06, 23.06 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 0, preserveTable, false));
      it('preserveTable cells (1)', testAdjustWidth(50, [ 25, 12.5, 37.5, 25 ], relativeTable(), percentageToStep(-12.5, 400), 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(50, [ 25, 12.5, 37.5, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 1, preserveTable, true));
      it('preserveTable overflow (1)', testAdjustWidth(50, [ 30.83, 10.56, 35.56, 23.06 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 1, preserveTable, false));
      it('preserveTable cells (2)', testAdjustWidth(50, [ 25, 25, 12.5, 37.5 ], relativeTable(), percentageToStep(-12.5, 400), 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(50, [ 25, 25, 12.5, 37.5 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 2, preserveTable, true));
      it('preserveTable overflow (2)', testAdjustWidth(50, [ 30.83, 23.06, 10.56, 35.56 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 2, preserveTable, false));
      it('preserveTable cells (3)', testAdjustWidth(43.75, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-12.5, 400), 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(43.75, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 3, preserveTable, true));
      // TODO: TINY-7942: This needs design input as the first cell ideally shouldn't shrink
      it('preserveTable overflow (3)', testAdjustWidth(43.75, [ 30.83, 23.06, 23.06, 23.06 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 3, preserveTable, false));
    });

    context('rtl large step (%)', () => {
      it('preserveTable cells (0)', testAdjustWidth(50, [ 2.5, 47.5, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(50, [ 2.5, 47.5, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 0, preserveTable, true));
      it('preserveTable cells (1)', testAdjustWidth(50, [ 25, 2.5, 47.5, 25 ], relativeTable(), percentageToStep(-50, 400), 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(50, [ 25, 2.5, 47.5, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 1, preserveTable, true));
      it('preserveTable cells (2)', testAdjustWidth(50, [ 25, 25, 2.5, 47.5 ], relativeTable(), percentageToStep(-50, 400), 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(50, [ 25, 25, 2.5, 47.5 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 2, preserveTable, true));
      it('preserveTable cells (3)', testAdjustWidth(25, [ 25, 25, 25, 25 ], relativeTable(), percentageToStep(-50, 400), 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(25, [ 25, 25, 25, 25 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 3, preserveTable, true));
    });

    context('ltr step (px)', () => {
      it('preserveTable cells (0)', testAdjustWidth(400, [ 146.75, 46.75, 96.75, 96.75 ], pixelTable(), 50, 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(400, [ 150, 50, 100, 100 ], pixelTableWithColGroup(), 50, 0, preserveTable, true));
      it('preserveTable overflow (0)', testAdjustWidth(400, [ 170, 39, 89, 89 ], pixelTableWithOverflow(), 50, 0, preserveTable, false));
      it('preserveTable cells (1)', testAdjustWidth(400, [ 96.75, 146.75, 46.75, 96.75 ], pixelTable(), 50, 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(400, [ 100, 150, 50, 100 ], pixelTableWithColGroup(), 50, 1, preserveTable, true));
      it('preserveTable overflow (1)', testAdjustWidth(400, [ 120, 139, 39, 89 ], pixelTableWithOverflow(), 50, 1, preserveTable, false));
      it('preserveTable cells (2)', testAdjustWidth(400, [ 96.75, 96.75, 146.75, 46.75 ], pixelTable(), 50, 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(400, [ 100, 100, 150, 50 ], pixelTableWithColGroup(), 50, 2, preserveTable, true));
      it('preserveTable overflow (2)', testAdjustWidth(400, [ 120, 89, 139, 39 ], pixelTableWithOverflow(), 50, 2, preserveTable, false));
      it('preserveTable cells (3)', testAdjustWidth(450, [ 109.25, 109.25, 109.25, 109.25 ], pixelTable(), 50, 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(450, [ 112.5, 112.5, 112.5, 112.5 ], pixelTableWithColGroup(), 50, 3, preserveTable, true));
      it('preserveTable overflow (3)', testAdjustWidth(450, [ 132.5, 101.5, 101.5, 101.5 ], pixelTableWithOverflow(), 50, 3, preserveTable, false));
    });

    context('ltr large step (px)', () => {
      it('preserveTable cells (0)', testAdjustWidth(400, [ 183.5, 10, 96.75, 96.75 ], pixelTable(), 200, 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(400, [ 190, 10, 100, 100 ], pixelTableWithColGroup(), 200, 0, preserveTable, true));
      it('preserveTable cells (1)', testAdjustWidth(400, [ 96.75, 183.5, 10, 96.75 ], pixelTable(), 200, 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(400, [ 100, 190, 10, 100 ], pixelTableWithColGroup(), 200, 1, preserveTable, true));
      it('preserveTable cells (2)', testAdjustWidth(400, [ 96.75, 96.75, 183.5, 10 ], pixelTable(), 200, 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(400, [ 100, 100, 190, 10 ], pixelTableWithColGroup(), 200, 2, preserveTable, true));
      it('preserveTable cells (3)', testAdjustWidth(600, [ 146.75, 146.75, 146.75, 146.75 ], pixelTable(), 200, 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(600, [ 150, 150, 150, 150 ], pixelTableWithColGroup(), 200, 3, preserveTable, true));
    });

    context('rtl step (px)', () => {
      it('preserveTable cells (0)', testAdjustWidth(400, [ 46.75, 146.75, 96.75, 96.75 ], pixelTable(), -50, 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(400, [ 50, 150, 100, 100 ], pixelTableWithColGroup(), -50, 0, preserveTable, true));
      // TODO: TINY-7942: This needs design input as it should be blocked since it can't be resized smaller
      it.skip('preserveTable overflow (0)', testAdjustWidth(400, [ 120, 89, 89, 89 ], pixelTableWithOverflow(), -50, 0, preserveTable, false));
      it('preserveTable cells (1)', testAdjustWidth(400, [ 96.75, 46.75, 146.75, 96.75 ], pixelTable(), -50, 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(400, [ 100, 50, 150, 100 ], pixelTableWithColGroup(), -50, 1, preserveTable, true));
      it('preserveTable overflow (1)', testAdjustWidth(400, [ 120, 39, 139, 89 ], pixelTableWithOverflow(), -50, 1, preserveTable, false));
      it('preserveTable cells (2)', testAdjustWidth(400, [ 96.75, 96.75, 46.75, 146.75 ], pixelTable(), -50, 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(400, [ 100, 100, 50, 150 ], pixelTableWithColGroup(), -50, 2, preserveTable, true));
      it('preserveTable overflow (2)', testAdjustWidth(400, [ 120, 89, 39, 139 ], pixelTableWithOverflow(), -50, 2, preserveTable, false));
      it('preserveTable cells (3)', testAdjustWidth(350, [ 84.25, 84.25, 84.25, 84.25 ], pixelTable(), -50, 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(350, [ 87.5, 87.5, 87.5, 87.5 ], pixelTableWithColGroup(), -50, 3, preserveTable, true));
      // TODO: TINY-7942: This needs design input as the first cell ideally shouldn't shrink
      it('preserveTable overflow (3)', testAdjustWidth(350, [ 107.5, 76.5, 76.5, 76.5 ], pixelTableWithOverflow(), -50, 3, preserveTable, false));
    });

    context('rtl large step (px)', () => {
      it('preserveTable cells (0)', testAdjustWidth(400, [ 10, 183.5, 96.75, 96.75 ], pixelTable(), -200, 0, preserveTable, false));
      it('preserveTable cols (0)', testAdjustWidth(400, [ 10, 190, 100, 100 ], pixelTableWithColGroup(), -200, 0, preserveTable, true));
      it('preserveTable cells (1)', testAdjustWidth(400, [ 96.75, 10, 183.5, 96.75 ], pixelTable(), -200, 1, preserveTable, false));
      it('preserveTable cols (1)', testAdjustWidth(400, [ 100, 10, 190, 100 ], pixelTableWithColGroup(), -200, 1, preserveTable, true));
      it('preserveTable cells (2)', testAdjustWidth(400, [ 96.75, 96.75, 10, 183.5 ], pixelTable(), -200, 2, preserveTable, false));
      it('preserveTable cols (2)', testAdjustWidth(400, [ 100, 100, 10, 190 ], pixelTableWithColGroup(), -200, 2, preserveTable, true));
      it('preserveTable cells (3)', testAdjustWidth( 200, [ 46.75, 46.75, 46.75, 46.75 ], pixelTable(), -200, 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth( 200, [ 50, 50, 50, 50 ], pixelTableWithColGroup(), -200, 3, preserveTable, true));
    });

    context('rtl extra large step (px)', () => {
      it('preserveTable cells (3)', testAdjustWidth(53, [ 10, 10, 10, 10 ], pixelTable(), -400, 3, preserveTable, false));
      it('preserveTable cols (3)', testAdjustWidth(40, [ 10, 10, 10, 10 ], pixelTableWithColGroup(), -400, 3, preserveTable, true));
    });
  });

  context('resize table column resizing', () => {
    context('ltr step (%)', () => {
      it('resizeTable cells (0)', testAdjustWidth(56.25, [ 33.33, 22.22, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(56.25, [ 33.33, 22.22, 22.22, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 0, resizeTable, true));
      it('resizeTable overflow (0)', testAdjustWidth(56.25, [ 38.51, 20.50, 20.50, 20.50 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 0, resizeTable, false));
      it('resizeTable cells (1)', testAdjustWidth(56.25, [ 22.22, 33.33, 22.22, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(56.25, [ 22.22, 33.33, 22.22, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 1, resizeTable, true));
      it('resizeTable overflow (1)', testAdjustWidth(56.25, [ 27.40, 31.61, 20.50, 20.50 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 1, resizeTable, false));
      it('resizeTable cells (2)', testAdjustWidth(56.25, [ 22.22, 22.22, 33.33, 22.22 ], relativeTable(), percentageToStep(12.5, 400), 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(56.25, [ 22.22, 22.22, 33.33, 22.22 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 2, resizeTable, true));
      it('resizeTable overflow (2)', testAdjustWidth(56.25, [ 27.40, 20.50, 31.61, 20.50 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 2, resizeTable, false));
      it('resizeTable cells (3)', testAdjustWidth(56.25, [ 22.22, 22.22, 22.22, 33.33 ], relativeTable(), percentageToStep(12.5, 400), 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(56.25, [ 22.22, 22.22, 22.22, 33.33 ], relativeTableWithColGroup(), percentageToStep(12.5, 400), 3, resizeTable, true));
      it('resizeTable overflow (3)', testAdjustWidth(56.25, [ 27.40, 20.50, 20.50, 31.61 ], relativeTableWithOverflow(), percentageToStep(12.5, 400), 3, resizeTable, false));
    });

    context('ltr large step (%)', () => {
      it('resizeTable cells (0)', testAdjustWidth(75, [ 50, 16.67, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(75, [ 50, 16.67, 16.67, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 0, resizeTable, true));
      it('resizeTable cells (1)', testAdjustWidth(75, [ 16.67, 50, 16.67, 16.67 ], relativeTable(), percentageToStep(50, 400), 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(75, [ 16.67, 50, 16.67, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 1, resizeTable, true));
      it('resizeTable cells (2)', testAdjustWidth(75, [ 16.67, 16.67, 50, 16.67 ], relativeTable(), percentageToStep(50, 400), 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(75, [ 16.67, 16.67, 50, 16.67 ], relativeTableWithColGroup(), percentageToStep(50, 400), 2, resizeTable, true));
      it('resizeTable cells (3)', testAdjustWidth(75, [ 16.67, 16.67, 16.67, 50 ], relativeTable(), percentageToStep(50, 400), 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(75, [ 16.67, 16.67, 16.67, 50 ], relativeTableWithColGroup(), percentageToStep(50, 400), 3, resizeTable, true));
    });

    context('rtl step (%)', () => {
      it('resizeTable cells (0)', testAdjustWidth(43.75, [ 14.29, 28.57, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(43.75, [ 14.29, 28.57, 28.57, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 0, resizeTable, true));
      // TODO: TINY-7942: This needs design input as it should be blocked since it can't be resized smaller
      it.skip('resizeTable overflow (0)', testAdjustWidth(50, [ 30.83, 23.06, 23.06, 23.06 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 0, resizeTable, false));
      it('resizeTable cells (1)', testAdjustWidth(43.75, [ 28.57, 14.29, 28.57, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(43.75, [ 28.57, 14.29, 28.57, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 1, resizeTable, true));
      it('resizeTable overflow (1)', testAdjustWidth(43.75, [ 35.23, 12.07, 26.35, 26.35 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 1, resizeTable, false));
      it('resizeTable cells (2)', testAdjustWidth(43.75, [ 28.57, 28.57, 14.29, 28.57 ], relativeTable(), percentageToStep(-12.5, 400), 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(43.75, [ 28.57, 28.57, 14.29, 28.57 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 2, resizeTable, true));
      it('resizeTable overflow (2)', testAdjustWidth(43.75, [ 35.23, 26.35, 12.07, 26.35 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 2, resizeTable, false));
      it('resizeTable cells (3)', testAdjustWidth(43.75, [ 28.57, 28.57, 28.57, 14.29 ], relativeTable(), percentageToStep(-12.5, 400), 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(43.75, [ 28.57, 28.57, 28.57, 14.29 ], relativeTableWithColGroup(), percentageToStep(-12.5, 400), 3, resizeTable, true));
      it('resizeTable overflow (3)', testAdjustWidth(43.75, [ 35.23, 26.35, 26.35, 12.07 ], relativeTableWithOverflow(), percentageToStep(-12.5, 400), 3, resizeTable, false));
    });

    context('rtl large step (%)', () => {
      it('resizeTable cells (0)', testAdjustWidth(38.75, [ 3.23, 32.26, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(38.75, [ 3.23, 32.26, 32.26, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 0, resizeTable, true));
      it('resizeTable cells (1)', testAdjustWidth(38.75, [ 32.26, 3.23, 32.26, 32.26 ], relativeTable(), percentageToStep(-50, 400), 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(38.75, [ 32.26, 3.23, 32.26, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 1, resizeTable, true));
      it('resizeTable cells (2)', testAdjustWidth(38.75, [ 32.26, 32.26, 3.23, 32.26 ], relativeTable(), percentageToStep(-50, 400), 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(38.75, [ 32.26, 32.26, 3.23, 32.26 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 2, resizeTable, true));
      it('resizeTable cells (3)', testAdjustWidth(38.75, [ 32.26, 32.26, 32.26, 3.23 ], relativeTable(), percentageToStep(-50, 400), 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(38.75, [ 32.26, 32.26, 32.26, 3.23 ], relativeTableWithColGroup(), percentageToStep(-50, 400), 3, resizeTable, true));
    });

    context('ltr step (px)', () => {
      it('resizeTable cells (0)', testAdjustWidth(450, [ 146.75, 96.75, 96.75, 96.75 ], pixelTable(), 50, 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(450, [ 150, 100, 100, 100 ], pixelTableWithColGroup(), 50, 0, resizeTable, true));
      it('resizeTable overflow (0)', testAdjustWidth(450, [ 170, 89, 89, 89 ], pixelTableWithOverflow(), 50, 0, resizeTable, false));
      it('resizeTable cells (1)', testAdjustWidth(450, [ 96.75, 146.75, 96.75, 96.75 ], pixelTable(), 50, 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(450, [ 100, 150, 100, 100 ], pixelTableWithColGroup(), 50, 1, resizeTable, true));
      it('resizeTable overflow (1)', testAdjustWidth(450, [ 120, 139, 89, 89 ], pixelTableWithOverflow(), 50, 1, resizeTable, false));
      it('resizeTable cells (2)', testAdjustWidth(450, [ 96.75, 96.75, 146.75, 96.75 ], pixelTable(), 50, 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(450, [ 100, 100, 150, 100 ], pixelTableWithColGroup(), 50, 2, resizeTable, true));
      it('resizeTable overflow (2)', testAdjustWidth(450, [ 120, 89, 139, 89 ], pixelTableWithOverflow(), 50, 2, resizeTable, false));
      it('resizeTable cells (3)', testAdjustWidth(450, [ 96.75, 96.75, 96.75, 146.75 ], pixelTable(), 50, 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(450, [ 100, 100, 100, 150 ], pixelTableWithColGroup(), 50, 3, resizeTable, true));
      it('resizeTable overflow (3)', testAdjustWidth(450, [ 120, 89, 89, 139 ], pixelTableWithOverflow(), 50, 3, resizeTable, false));
    });

    context('ltr large step (px)', () => {
      it('resizeTable cells (0)', testAdjustWidth(600, [ 296.75, 96.75, 96.75, 96.75 ], pixelTable(), 200, 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(600, [ 300, 100, 100, 100 ], pixelTableWithColGroup(), 200, 0, resizeTable, true));
      it('resizeTable cells (1)', testAdjustWidth(600, [ 96.75, 296.75, 96.75, 96.75 ], pixelTable(), 200, 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(600, [ 100, 300, 100, 100 ], pixelTableWithColGroup(), 200, 1, resizeTable, true));
      it('resizeTable cells (2)', testAdjustWidth(600, [ 96.75, 96.75, 296.75, 96.75 ], pixelTable(), 200, 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(600, [ 100, 100, 300, 100 ], pixelTableWithColGroup(), 200, 2, resizeTable, true));
      it('resizeTable cells (3)', testAdjustWidth(600, [ 96.75, 96.75, 96.75, 296.75 ], pixelTable(), 200, 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(600, [ 100, 100, 100, 300 ], pixelTableWithColGroup(), 200, 3, resizeTable, true));
    });

    context('rtl step (px)', () => {
      it('resizeTable cells (0)', testAdjustWidth(350, [ 46.75, 96.75, 96.75, 96.75 ], pixelTable(), -50, 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(350, [ 50, 100, 100, 100 ], pixelTableWithColGroup(), -50, 0, resizeTable, true));
      // TODO: TINY-7942: This needs design input as it should be blocked since it can't be resized smaller
      it.skip('resizeTable overflow (0)', testAdjustWidth(400, [ 120, 89, 89, 89 ], pixelTableWithOverflow(), -50, 0, resizeTable, false));
      it('resizeTable cells (1)', testAdjustWidth(350, [ 96.75, 46.75, 96.75, 96.75 ], pixelTable(), -50, 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(350, [ 100, 50, 100, 100 ], pixelTableWithColGroup(), -50, 1, resizeTable, true));
      it('resizeTable overflow (1)', testAdjustWidth(350, [ 120, 39, 89, 89 ], pixelTableWithOverflow(), -50, 1, resizeTable, false));
      it('resizeTable cells (2)', testAdjustWidth(350, [ 96.75, 96.75, 46.75, 96.75 ], pixelTable(), -50, 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(350, [ 100, 100, 50, 100 ], pixelTableWithColGroup(), -50, 2, resizeTable, true));
      it('resizeTable overflow (2)', testAdjustWidth(350, [ 120, 89, 39, 89 ], pixelTableWithOverflow(), -50, 2, resizeTable, false));
      it('resizeTable cells (3)', testAdjustWidth(350, [ 96.75, 96.75, 96.75, 46.75 ], pixelTable(), -50, 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(350, [ 100, 100, 100, 50 ], pixelTableWithColGroup(), -50, 3, resizeTable, true));
      it('resizeTable overflow (3)', testAdjustWidth(350, [ 120, 89, 89, 39 ], pixelTableWithOverflow(), -50, 3, resizeTable, false));
    });

    context('rtl large step (px)', () => {
      it('resizeTable cells (0)', testAdjustWidth(313.25, [ 10, 96.75, 96.75, 96.75 ], pixelTable(), -200, 0, resizeTable, false));
      it('resizeTable cols (0)', testAdjustWidth(310, [ 10, 100, 100, 100 ], pixelTableWithColGroup(), -200, 0, resizeTable, true));
      it('resizeTable cells (1)', testAdjustWidth(313.25, [ 96.75, 10, 96.75, 96.75 ], pixelTable(), -200, 1, resizeTable, false));
      it('resizeTable cols (1)', testAdjustWidth(310, [ 100, 10, 100, 100 ], pixelTableWithColGroup(), -200, 1, resizeTable, true));
      it('resizeTable cells (2)', testAdjustWidth(313.25, [ 96.75, 96.75, 10, 96.75 ], pixelTable(), -200, 2, resizeTable, false));
      it('resizeTable cols (2)', testAdjustWidth(310, [ 100, 100, 10, 100 ], pixelTableWithColGroup(), -200, 2, resizeTable, true));
      it('resizeTable cells (3)', testAdjustWidth(313.25, [ 96.75, 96.75, 96.75, 10 ], pixelTable(), -200, 3, resizeTable, false));
      it('resizeTable cols (3)', testAdjustWidth(310, [ 100, 100, 100, 10 ], pixelTableWithColGroup(), -200, 3, resizeTable, true));
    });
  });
});
