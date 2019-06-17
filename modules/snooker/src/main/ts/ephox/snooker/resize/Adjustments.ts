import { Arr } from '@ephox/katamari';
import Deltas from '../calc/Deltas';
import DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import ColumnSizes from './ColumnSizes';
import Recalculations from './Recalculations';
import Sizes from './Sizes';
import TableSize from './TableSize';
import CellUtils from '../util/CellUtils';
import { RowData, Detail } from '../api/Structs';
import { Element } from '@ephox/sugar';
import { BarPositions, ColInfo, RowInfo } from './BarPositions';

const getWarehouse = function <T extends Detail>(list: RowData<T>[]) {
  return Warehouse.generate(list);
};

const sumUp = function (newSize: number[]) {
  return Arr.foldr(newSize, function (b, a) {
    return b + a;
  }, 0);
};

const getTableWarehouse = function (table: Element) {
  const list = DetailsList.fromTable(table);
  return getWarehouse(list);
};

const adjustWidth = function (table: Element, delta: number, index: number, direction: BarPositions<ColInfo>) {
  const tableSize = TableSize.getTableSize(table);
  const step = tableSize.getCellDelta(delta);
  const warehouse = getTableWarehouse(table);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Calculate all of the new widths for columns
  const deltas = Deltas.determine(widths, index, step, tableSize);
  const newWidths = Arr.map(deltas, function (dx, i) {
    return dx + widths[i];
  });

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, newWidths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element(), cell.width());
  });

  // Set the overall width of the table.
  if (index === warehouse.grid().columns() - 1) {
    tableSize.setTableWidth(table, newWidths, step);
  }
};

const adjustHeight = function (table: Element, delta: number, index: number, direction: BarPositions<RowInfo>) {
  const warehouse = getTableWarehouse(table);
  const heights = ColumnSizes.getPixelHeights(warehouse, direction);

  const newHeights = Arr.map(heights, function (dy, i) {
    return index === i ? Math.max(delta + dy, CellUtils.minHeight()) : dy;
  });

  const newCellSizes = Recalculations.recalculateHeight(warehouse, newHeights);
  const newRowSizes = Recalculations.matchRowHeight(warehouse, newHeights);

  Arr.each(newRowSizes, function (row) {
    Sizes.setHeight(row.element(), row.height());
  });

  Arr.each(newCellSizes, function (cell) {
    Sizes.setHeight(cell.element(), cell.height());
  });

  const total = sumUp(newHeights);
  Sizes.setHeight(table, total);
};

// Ensure that the width of table cells match the passed in table information.
const adjustWidthTo = function <T extends Detail>(table: Element, list: RowData<T>[], direction: BarPositions<ColInfo>) {
  const tableSize = TableSize.getTableSize(table);
  const warehouse = getWarehouse(list);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, widths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element(), cell.width());
  });

  // const total = Arr.foldr(widths, function (b, a) { return a + b; }, 0);
  if (newSizes.length > 0) {
    // tableSize.setTableWidth(table, total);
    // WARNING, this may be incorrect, the commented out code above was the original
    tableSize.setTableWidth(table, widths, tableSize.getCellDelta(0));
  }
};

export default {
  adjustWidth,
  adjustHeight,
  adjustWidthTo
};