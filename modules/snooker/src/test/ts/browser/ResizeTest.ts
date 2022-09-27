import { after, before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Deltas from 'ephox/snooker/calc/Deltas';

describe('ResizeTest', () => {
  const resizing = ResizeBehaviour.preserveTable();
  const boundBox = '<div style="width: 800px; height: 600px; display: block;"></div>';
  const box = SugarElement.fromHtml<HTMLDivElement>(boundBox);

  before(() => {
    Insert.append(SugarBody.body(), box);
  });

  after(() => {
    Remove.remove(box);
  });

  it('should be able to resize a percent table with percent cells', () => {
    const delta = 200;

    const table = SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 100%;">
    <tbody>
    <tr>
    <td style="width: 50%;">A</td>
    <td style="width: 50%;">B</td>
    </tr>
    <tr>
    <td style="width: 50%;">C</td>
    <td style="width: 50%;">D</td>
    </tr>
    <tr>
    <td style="width: 50%;">E</td>
    <td style="width: 50%;">F</td>
    </tr>
    </tbody>
    </table>`);

    Insert.append(box, table);

    const tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.equal(100, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.equal(25, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.deepEqual([ 50, 50 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.deepEqual([ 25, -25 ], deltas);

    // Set new width
    tableSize.adjustTableWidth(step);
    assert.equal(Css.getRaw(table, 'width').getOrDie(), '125%');

    Remove.remove(table);
  });

  it('should be able to resize a percent table with pixel cells', () => {
    const delta = 200;

    const table = SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 100%;">
    <tbody>
    <tr>
    <td style="width: 400px;">A</td>
    <td style="width: 400px;">B</td>
    </tr>
    <tr>
    <td style="width: 400px;">C</td>
    <td style="width: 400px;">D</td>
    </tr>
    <tr>
    <td style="width: 400px;">E</td>
    <td style="width: 400px;">F</td>
    </tr>
    </tbody>
    </table>`);

    Insert.append(box, table);

    const tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.equal(100, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.equal(25, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // percentage width of this table is 100% but pixel maths can lead to rounding errors
    // in order for us to pass this test, we ensure that the difference between what we wanted (50%)
    // and the actual are within a tolerance of 1%
    Arr.each([ 50, 50 ], (expected, i) => {
      assert.approximately(widths[i], expected, 1);
    });

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.deepEqual([ 25, -25 ], deltas);

    // Set new width
    tableSize.adjustTableWidth(step);
    assert.equal(Css.getRaw(table, 'width').getOrDie(), '125%');

    Remove.remove(table);
  });

  it('should be able to resize a pixel table with pixel cells', () => {
    const delta = 200;

    const table = SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 800px;">
    <tbody>
    <tr>
    <td style="width: 400px;">A</td>
    <td style="width: 400px;">B</td>
    </tr>
    <tr>
    <td style="width: 400px;">C</td>
    <td style="width: 400px;">D</td>
    </tr>
    <tr>
    <td style="width: 400px;">E</td>
    <td style="width: 400px;">F</td>
    </tr>
    </tbody>
    </table>`);

    Insert.append(box, table);

    const tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.equal(800, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.equal(200, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.deepEqual([ 398, 398 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.deepEqual([ 200, -200 ], deltas);

    Remove.remove(table);
  });

  it('should be able to resize a pixel table with percent cells', () => {
    const delta = 200;

    const table = SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 800px;">
    <tbody>
    <tr>
    <td style="width: 50%;">A</td>
    <td style="width: 50%;">B</td>
    </tr>
    <tr>
    <td style="width: 50%;">C</td>
    <td style="width: 50%;">D</td>
    </tr>
    <tr>
    <td style="width: 50%;">E</td>
    <td style="width: 50%;">F</td>
    </tr>
    </tbody>
    </table>`);

    Insert.append(box, table);

    const tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.equal(800, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.equal(200, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.deepEqual([ 398, 398 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.deepEqual([ 200, -200 ], deltas);

    Remove.remove(table);
  });

  it('TINY-7731: should handle resizing a table where a cell overflows its specified size', () => {
    const delta = 200;

    const table = SugarElement.fromHtml<HTMLTableElement>(`<table style="border-collapse: collapse; width: 800px;">
    <tbody>
    <tr>
    <td style="width: 400px;"><span style="display: inline-block; width: 483px"></span></td>
    <td style="width: 400px;">B</td>
    </tr>
    <tr>
    <td style="width: 400px;">C</td>
    <td style="width: 400px;">D</td>
    </tr>
    </tbody>
    </table>`);

    Insert.append(box, table);

    const tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.equal(800, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.equal(200, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // This is the width of "thisisareallylongsentencewithoutspacesthatcausescontenttooverflow" which can vary marginally between browsers
    assert.approximately(widths[0], 483, 1, 'First column width');
    assert.approximately(widths[1], 313, 1, 'Second column width');

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.deepEqual([ 200, -200 ], deltas);

    Remove.remove(table);
  });
});
