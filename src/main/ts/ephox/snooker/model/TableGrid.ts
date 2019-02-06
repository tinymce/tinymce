import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import GridRow from './GridRow';

var getColumn = function (grid, index) {
  return Arr.map(grid, function (row) {
    return GridRow.getCell(row, index);
  });
};

var getRow = function (grid, index) {
  return grid[index];
};


var findDiff = function (xs, comp) {
  if (xs.length === 0) return 0;
  var first = xs[0];
  var index = Arr.findIndex(xs, function (x) {
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
var subgrid = function (grid, row, column, comparator) {
  var restOfRow = getRow(grid, row).cells().slice(column);
  var endColIndex = findDiff(restOfRow, comparator);

  var restOfColumn = getColumn(grid, column).slice(row);
  var endRowIndex = findDiff(restOfColumn, comparator);

  return {
    colspan: Fun.constant(endColIndex),
    rowspan: Fun.constant(endRowIndex)
  };
};

export default {
  subgrid: subgrid
};