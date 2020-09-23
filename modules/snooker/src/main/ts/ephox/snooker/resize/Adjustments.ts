import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { ResizeBehaviour } from '../api/ResizeBehaviour';
import { Detail, RowData } from '../api/Structs';
import { TableSize } from '../api/TableSize';
import * as Deltas from '../calc/Deltas';
import { Warehouse } from '../api/Warehouse';
import * as CellUtils from '../util/CellUtils';
import * as ColumnSizes from './ColumnSizes';
import * as Recalculations from './Recalculations';
import * as Sizes from './Sizes';
import { BarPositions, RowInfo } from './BarPositions';

const sumUp = (newSize: number[]) => Arr.foldr(newSize, (b, a) => b + a, 0);

const recalculate = (warehouse: Warehouse, widths: number[]): Recalculations.CellWidthSpan[] => {
  if (Warehouse.hasColumns(warehouse)) {
    return Recalculations.recalculateWidthForColumns(warehouse, widths);
  } else {
    return Recalculations.recalculateWidthForCells(warehouse, widths);
  }
};

const recalculateAndApply = (warehouse: Warehouse, widths: number[], tableSize: TableSize): void => {
  // Set the width of each cell based on the column widths
  const newSizes = recalculate(warehouse, widths);

  Arr.each(newSizes, (cell) => {
    tableSize.setElementWidth(cell.element, cell.width);
  });
};

const adjustWidth = (table: SugarElement, delta: number, index: number, resizing: ResizeBehaviour, tableSize: TableSize) => {
  const warehouse = Warehouse.fromTable(table);
  const step = tableSize.getCellDelta(delta);
  const widths = tableSize.getWidths(warehouse, tableSize);
  const isLastColumn = index === warehouse.grid.columns - 1;
  const clampedStep = resizing.clampTableDelta(widths, index, step, tableSize.minCellWidth(), isLastColumn);

  // Calculate all of the new widths for columns
  const deltas = Deltas.determine(widths, index, clampedStep, tableSize, resizing);
  const newWidths = Arr.map(deltas, (dx, i) => dx + widths[i]);

  recalculateAndApply(warehouse, newWidths, tableSize);
  resizing.resizeTable(tableSize.adjustTableWidth, clampedStep, isLastColumn);
};

const adjustHeight = (table: SugarElement, delta: number, index: number, direction: BarPositions<RowInfo>) => {
  const warehouse = Warehouse.fromTable(table);
  const heights = ColumnSizes.getPixelHeights(warehouse, direction);

  const newHeights = Arr.map(heights, (dy, i) => index === i ? Math.max(delta + dy, CellUtils.minHeight()) : dy);

  const newCellSizes = Recalculations.recalculateHeightForCells(warehouse, newHeights);
  const newRowSizes = Recalculations.matchRowHeight(warehouse, newHeights);

  Arr.each(newRowSizes, (row) => {
    Sizes.setHeight(row.element, row.height);
  });

  Arr.each(newCellSizes, (cell) => {
    Sizes.setHeight(cell.element, cell.height);
  });

  const total = sumUp(newHeights);
  Sizes.setHeight(table, total);
};

// Ensure that the width of table cells match the passed in table information.
const adjustWidthTo = <T extends Detail> (table: SugarElement, list: RowData<T>[], tableSize: TableSize) => {
  const warehouse = Warehouse.generate(list);
  const widths = tableSize.getWidths(warehouse, tableSize);

  recalculateAndApply(warehouse, widths, tableSize);
};

export { adjustWidth, adjustHeight, adjustWidthTo };
