import { Arr } from '@ephox/katamari';
import Deltas from '../calc/Deltas';
import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';
import ColumnSizes from './ColumnSizes';
import Recalculations from './Recalculations';
import Sizes from './Sizes';
import TableSize from './TableSize';
import CellUtils from '../util/CellUtils';

var getWarehouse = function (list) {
  return Warehouse.generate(list);
};

var sumUp = function (newSize) {
  return Arr.foldr(newSize, function (b, a) { return b + a; }, 0);
};

var getTableWarehouse = function (table) {
  var list = DetailsList.fromTable(table);
  return getWarehouse(list);
};

var adjustWidth = function (table, delta, index, direction) {
  var tableSize = TableSize.getTableSize(table);
  var step = tableSize.getCellDelta(delta);
  var warehouse = getTableWarehouse(table);
  var widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Calculate all of the new widths for columns
  var deltas = Deltas.determine(widths, index, step, tableSize);
  var newWidths = Arr.map(deltas, function (dx, i) {
    return dx + widths[i];
  });

  // Set the width of each cell based on the column widths
  var newSizes = Recalculations.recalculateWidth(warehouse, newWidths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element(), cell.width());
  });

  // Set the overall width of the table.
  if (index === warehouse.grid().columns() - 1) {
    tableSize.setTableWidth(table, newWidths, step);
  }
};

var adjustHeight = function (table, delta, index, direction) {
  var warehouse = getTableWarehouse(table);
  var heights = ColumnSizes.getPixelHeights(warehouse, direction);

  var newHeights = Arr.map(heights, function (dy, i) {
    return index === i ? Math.max(delta + dy, CellUtils.minHeight()) : dy;
  });

  var newCellSizes = Recalculations.recalculateHeight(warehouse, newHeights);
  var newRowSizes = Recalculations.matchRowHeight(warehouse, newHeights);

  Arr.each(newRowSizes, function (row) {
    Sizes.setHeight(row.element(), row.height());
  });

  Arr.each(newCellSizes, function (cell) {
    Sizes.setHeight(cell.element(), cell.height());
  });

  var total = sumUp(newHeights);
  Sizes.setHeight(table, total);
};

// Ensure that the width of table cells match the passed in table information.
var adjustWidthTo = function (table, list, direction) {
  var tableSize = TableSize.getTableSize(table);
  var warehouse = getWarehouse(list);
  var widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Set the width of each cell based on the column widths
  var newSizes = Recalculations.recalculateWidth(warehouse, widths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element(), cell.width());
  });

  var total = Arr.foldr(widths, function (b, a) { return a + b; }, 0);
  if (newSizes.length > 0) {
    tableSize.setTableWidth(table, total);
  }
};

export default {
  adjustWidth: adjustWidth,
  adjustHeight: adjustHeight,
  adjustWidthTo: adjustWidthTo
};