import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { ElementNew, RowCells } from '../api/Structs';
import * as GridRow from './GridRow';

const getColumn = (grid: RowCells[], index: number): ElementNew[] => {
  return Arr.map(grid, (row) => {
    return GridRow.getCell(row, index);
  });
};

const getRow = (grid: RowCells[], index: number) => {
  return grid[index];
};

const findDiff = (xs: ElementNew[], comp: (a: SugarElement, b: SugarElement) => boolean) => {
  if (xs.length === 0) {
    return 0;
  }
  const first = xs[0];
  const index = Arr.findIndex(xs, (x) => {
    return !comp(first.element, x.element);
  });
  return index.getOr(xs.length);
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
const subgrid = (grid: RowCells[], row: number, column: number, comparator: (a: SugarElement, b: SugarElement) => boolean): { colspan: number; rowspan: number } => {
  const gridRow = getRow(grid, row);
  const isColRow = gridRow.section === 'colgroup';

  const colspan = findDiff(gridRow.cells.slice(column), comparator);
  const rowspan = isColRow ? 1 : findDiff(getColumn(grid.slice(row), column), comparator);

  return {
    colspan,
    rowspan
  };
};

export {
  subgrid
};
