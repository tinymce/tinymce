import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';

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
  readonly element: SugarElement;
}

interface CellHeight {
  readonly height: number;
  readonly element: SugarElement;
}

interface CellHeightSpan extends CellHeight {
  readonly rowspan: number;
}

// Returns an array of all cells in warehouse with updated cell-widths, using
// the array 'widths' of the representative widths of each column of the table 'warehouse'
const recalculateWidthForCells = (warehouse: Warehouse, widths: number[]): CellWidthSpan[] => {
  const all = Warehouse.justCells(warehouse);

  return Arr.map(all, function (cell) {
    // width of a spanning cell is sum of widths of representative columns it spans
    const width = total(cell.column, cell.column + cell.colspan, widths);
    return {
      element: cell.element,
      width,
      colspan: cell.colspan
    };
  });
};

const recalculateWidthForColumns = (warehouse: Warehouse, widths: number[]): CellWidthSpan[] => {
  const groups = Warehouse.justColumns(warehouse);

  return Arr.map(groups, (column: Structs.Column, index: number) => ({
    element: column.element,
    width: widths[index],
    colspan: column.colspan
  }));
};

const recalculateHeightForCells = (warehouse: Warehouse, heights: number[]): CellHeightSpan[] => {
  const all = Warehouse.justCells(warehouse);
  return Arr.map(all, (cell) => {
    const height = total(cell.row, cell.row + cell.rowspan, heights);
    return {
      element: cell.element,
      height,
      rowspan: cell.rowspan
    };
  });
};

const matchRowHeight = function (warehouse: Warehouse, heights: number[]): CellHeight[] {
  return Arr.map(warehouse.all, function (row, i) {
    return {
      element: row.element,
      height: heights[i]
    };
  });
};

export {
  recalculateWidthForCells,
  recalculateWidthForColumns,
  recalculateHeightForCells,
  matchRowHeight,
  CellWidthSpan
};
