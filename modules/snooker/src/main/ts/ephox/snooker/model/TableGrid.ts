import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { ElementNew, RowCells } from '../api/Structs';
import * as GridRow from './GridRow';

const getColumn = function (grid: RowCells[], index: number): ElementNew[] {
  return Arr.map(grid, function (row) {
    return GridRow.getCell(row, index);
  });
};

const getRow = function (grid: RowCells[], index: number) {
  return grid[index];
};

const findDiff = function (xs: ElementNew[], comp: (a: SugarElement, b: SugarElement) => boolean) {
  if (xs.length === 0) {
    return 0;
  }
  const first = xs[0];
  const index = Arr.findIndex(xs, function (x) {
    return !comp(first.element, x.element);
  });
  return index.fold(function () {
    return xs.length;
  }, function (ind) {
    return ind;
  });
};

/*
 * grid is the grid
 * row is the row index into the grid
 * column in the column index into the grid
 *
 * Return
 *   colspan: column span of the cell at (row, column)
 *   rowspan: row span of the cell at (row, column)
 */
const subgrid = function (grid: RowCells[], row: number, column: number, comparator: (a: SugarElement, b: SugarElement) => boolean): { colspan: number; rowspan: number } {
  const restOfRow = getRow(grid, row).cells.slice(column);
  const endColIndex = findDiff(restOfRow, comparator);

  const restOfColumn = getColumn(grid, column).slice(row);
  const endRowIndex = findDiff(restOfColumn, comparator);

  return {
    colspan: endColIndex,
    rowspan: endRowIndex
  };
};

export {
  subgrid
};
