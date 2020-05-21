import { Arr } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Detail, RowData } from '../api/Structs';
import { TableSize } from '../api/TableSize';
import * as Deltas from '../calc/Deltas';
import { Warehouse } from '../model/Warehouse';
import * as CellUtils from '../util/CellUtils';
import { BarPositions, ColInfo, RowInfo } from './BarPositions';
import * as ColumnSizes from './ColumnSizes';
import * as Recalculations from './Recalculations';
import * as Sizes from './Sizes';

const sumUp = function (newSize: number[]) {
  return Arr.foldr(newSize, function (b, a) {
    return b + a;
  }, 0);
};

const adjustWidth = function (table: Element, delta: number, index: number, direction: BarPositions<ColInfo>, tableSize: TableSize) {
  const step = tableSize.getCellDelta(delta);
  const warehouse = Warehouse.fromTable(table);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Calculate all of the new widths for columns
  const deltas = Deltas.determine(widths, index, step, tableSize);
  const newWidths = Arr.map(deltas, function (dx, i) {
    return dx + widths[i];
  });

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, newWidths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element, cell.width);
  });

  // Set the overall width of the table.
  if (index === warehouse.grid.columns() - 1) {
    tableSize.adjustTableWidth(step);
  }
};

const adjustHeight = function (table: Element, delta: number, index: number, direction: BarPositions<RowInfo>) {
  const warehouse = Warehouse.fromTable(table);
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
const adjustWidthTo = function <T extends Detail> (table: Element, list: RowData<T>[], direction: BarPositions<ColInfo>, tableSize: TableSize) {
  const warehouse = Warehouse.generate(list);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, widths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element, cell.width);
  });
};

export {
  adjustWidth,
  adjustHeight,
  adjustWidthTo
};
