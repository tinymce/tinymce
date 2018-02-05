import { Arr } from '@ephox/katamari';
import ResizeDirection from 'ephox/snooker/api/ResizeDirection';
import Deltas from 'ephox/snooker/calc/Deltas';
import DetailsList from 'ephox/snooker/model/DetailsList';
import Warehouse from 'ephox/snooker/model/Warehouse';
import TableSize from 'ephox/snooker/resize/TableSize';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Body } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ResizeTest', function() {
  var getWarehouse = function (table) {
    var list = DetailsList.fromTable(table);
    return Warehouse.generate(list);
  };

  var direction = ResizeDirection.ltr;

  var boundBox = '<div style="width: 800px; height: 600px; display: block;"></div>';
  var box = Element.fromHtml(boundBox);
  Insert.append(Body.body(), box);

  var percentTablePercentCellsTest = function () {
    var delta = 200;

    var table = Element.fromHtml(`<table style="border-collapse: collapse; width: 100%;">
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

    var tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.eq(100, tableSize.width());

    // 25% width delta
    var step = tableSize.getCellDelta(delta);
    assert.eq(25, step);

    var warehouse = getWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([50, 50], widths);

    var deltas = Deltas.determine(widths, 0, step, tableSize);

    // [25%, -25%] deltas.
    assert.eq([25, -25], deltas);

    var newWidths = Arr.map(deltas, function (dx, i) {
      return dx + widths[i];
    });

    Remove.remove(table);
  };

  var percentTablePixelCellsTest = function () {
    var delta = 200;

    var table = Element.fromHtml(`<table style="border-collapse: collapse; width: 100%;">
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

    var tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.eq(100, tableSize.width());

    // 25% width delta
    var step = tableSize.getCellDelta(delta);
    assert.eq(25, step);

    var warehouse = getWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);

    var expectedWidths = [50, 50];

    var widthDiffs = Arr.map(expectedWidths, (x,i) => {
      return widths[i] - x;
    });

    // percentage width of this table is 100% but phantom treats this as around 804 pixels when we're doing conversions
    // we have pixel width cells of 400px, so the actual widths of the cells in percentages
    // in order for us to pass this test, we ensure that the difference between what we wanted (50%)
    // and the actual (50.125% and 49.825% respectively) are within a tolerance of 1%
    Arr.each(widthDiffs, (x) => {
      assert.eq(true, x < 1 && x > -1);
    });

    var deltas = Deltas.determine(widths, 0, step, tableSize);

    // [25%, -25%] deltas.
    assert.eq([25, -25], deltas);

    var newWidths = Arr.map(deltas, function (dx, i) {
      return dx + widths[i];
    });

    Remove.remove(table);
  };

  var pixelTablePixelCellsTest = function () {
    var delta = 200;

    var table = Element.fromHtml(`<table style="border-collapse: collapse; width: 800px;">
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

    var tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.eq(800, tableSize.width());

    // 25% width delta
    var step = tableSize.getCellDelta(delta);
    assert.eq(200, step);

    var warehouse = getWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([400, 400], widths);

    var deltas = Deltas.determine(widths, 0, step, tableSize);

    // [25%, -25%] deltas.
    assert.eq([200, -200], deltas);

    var newWidths = Arr.map(deltas, function (dx, i) {
      return dx + widths[i];
    });

    Remove.remove(table);
  };

  var pixelTablePercentCellsTest = function () {
    var delta = 200;

    var table = Element.fromHtml(`<table style="border-collapse: collapse; width: 800px;">
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

    var tableSize = TableSize.getTableSize(table);

    // 100% width table
    assert.eq(800, tableSize.width());

    // 25% width delta
    var step = tableSize.getCellDelta(delta);
    assert.eq(200, step);

    var warehouse = getWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);

    // [50%, 50%] existing widths.
    assert.eq([400, 400], widths);

    var deltas = Deltas.determine(widths, 0, step, tableSize);

    // [25%, -25%] deltas.
    assert.eq([200, -200], deltas);

    var newWidths = Arr.map(deltas, function (dx, i) {
      return dx + widths[i];
    });

    Remove.remove(table);
  };

  percentTablePercentCellsTest();
  percentTablePixelCellsTest();
  pixelTablePixelCellsTest();
  pixelTablePercentCellsTest();
});

