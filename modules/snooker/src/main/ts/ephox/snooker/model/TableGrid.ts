import { Arr, Fun } from '@ephox/katamari';
import GridRow from './GridRow';

const getColumn = function (grid, index) {
  return Arr.map(grid, function (row) {
    return GridRow.getCell(row, index);
  });
};

const getRow = function (grid, index) {
  return grid[index];
};

const findDiff = function (xs, comp) {
  if (xs.length === 0) { return 0; }
  const first = xs[0];
  const index = Arr.findIndex(xs, function (x) {
    return !comp(first.element(), x.element());
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
const subgrid = function (grid, row, column, comparator) {
  const restOfRow = getRow(grid, row).cells().slice(column);
  const endColIndex = findDiff(restOfRow, comparator);

  const restOfColumn = getColumn(grid, column).slice(row);
  const endRowIndex = findDiff(restOfColumn, comparator);

  return {
    colspan: Fun.constant(endColIndex),
    rowspan: Fun.constant(endRowIndex)
  };
};

export default {
  subgrid
};