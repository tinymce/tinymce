import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Deltas from 'ephox/snooker/calc/Deltas';

UnitTest.test('ResizeTest', () => {
  const resizing = ResizeBehaviour.preserveTable();

  const boundBox = '<div style="width: 800px; height: 600px; display: block;"></div>';
  const box = SugarElement.fromHtml<HTMLDivElement>(boundBox);
  Insert.append(SugarBody.body(), box);

  const percentTablePercentCellsTest = () => {
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
    assert.eq(100, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.eq(25, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([ 50, 50 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.eq([ 25, -25 ], deltas);

    // Set new width
    tableSize.adjustTableWidth(step);
    assert.eq(Css.getRaw(table, 'width').getOrDie(), '125%');

    Remove.remove(table);
  };

  const percentTablePixelCellsTest = () => {
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
    assert.eq(100, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.eq(25, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    const expectedWidths = [ 50, 50 ];

    const widthDiffs = Arr.map(expectedWidths, (x, i) => widths[i] - x);

    // percentage width of this table is 100% but phantom treats this as around 804 pixels when we're doing conversions
    // we have pixel width cells of 400px, so the actual widths of the cells in percentages
    // in order for us to pass this test, we ensure that the difference between what we wanted (50%)
    // and the actual (50.125% and 49.825% respectively) are within a tolerance of 1%
    Arr.each(widthDiffs, (x) => {
      assert.eq(true, x < 1 && x > -1);
    });

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.eq([ 25, -25 ], deltas);

    // Set new width
    tableSize.adjustTableWidth(step);
    assert.eq(Css.getRaw(table, 'width').getOrDie(), '125%');

    Remove.remove(table);
  };

  const pixelTablePixelCellsTest = () => {
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
    assert.eq(800, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.eq(200, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([ 400, 400 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.eq([ 200, -200 ], deltas);

    Remove.remove(table);
  };

  const pixelTablePercentCellsTest = () => {
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
    assert.eq(800, tableSize.width());

    // 25% width delta
    const step = tableSize.getCellDelta(delta);
    assert.eq(200, step);

    const warehouse = Warehouse.fromTable(table);
    const widths = tableSize.getWidths(warehouse, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([ 400, 400 ], widths);

    const deltas = Deltas.determine(widths, 0, step, tableSize, resizing);

    // [25%, -25%] deltas.
    assert.eq([ 200, -200 ], deltas);

    Remove.remove(table);
  };

  percentTablePercentCellsTest();
  percentTablePixelCellsTest();
  pixelTablePixelCellsTest();
  pixelTablePercentCellsTest();
  Remove.remove(box);
});
