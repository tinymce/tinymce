import { Arr, Fun } from '@ephox/katamari';
import { Warehouse } from '../model/Warehouse';
import { Element } from '@ephox/sugar';

// Returns the sum of elements of measures in the half-open range [start, end)
// Measures is in pixels, treated as an array of integers or integers in string format.
// NOTE: beware of accumulated rounding errors over multiple columns - could result in noticeable table width changes
const total = function (start: number, end: number, measures: number[]): number {
  let r = 0;
  for (let i = start; i < end; i++) {
    r += measures[i] !== undefined ? measures[i] : 0;
  }
  return r;
};

interface CellWidthSpan {
  readonly colspan: number;
  readonly width: number;
  readonly element: Element;
}

// Returns an array of all cells in warehouse with updated cell-widths, using
// the array 'widths' of the representative widths of each column of the table 'warehouse'
const recalculateWidth = function (warehouse: Warehouse, widths: number[]): CellWidthSpan[] {
  const all = Warehouse.justCells(warehouse);

  return Arr.map(all, function (cell) {
    // width of a spanning cell is sum of widths of representative columns it spans
    const width = total(cell.column(), cell.column() + cell.colspan(), widths);
    return {
      element: cell.element(),
      width,
      colspan: cell.colspan()
    };
  });
};

const recalculateHeight = function (warehouse: Warehouse, heights: number[]) {
  const all = Warehouse.justCells(warehouse);
  return Arr.map(all, function (cell) {
    const height = total(cell.row(), cell.row() + cell.rowspan(), heights);
    return {
      element: cell.element,
      height: Fun.constant(height),
      rowspan: cell.rowspan
    };
  });
};

const matchRowHeight = function (warehouse: Warehouse, heights: number[]) {
  return Arr.map(warehouse.all, function (row, i) {
    return {
      element: row.element,
      height: Fun.constant(heights[i])
    };
  });
};

export {
  recalculateWidth,
  recalculateHeight,
  matchRowHeight
};
