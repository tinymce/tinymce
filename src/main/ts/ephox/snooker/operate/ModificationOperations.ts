import { Arr } from '@ephox/katamari';
import Structs from '../api/Structs';
import GridRow from '../model/GridRow';

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the row index)
// index is the insert position (at - or after - example) (the row index)
var insertRowAt = function (grid, index, example, comparator, substitution) {
  var before = grid.slice(0, index);
  var after = grid.slice(index);

  var between = GridRow.mapCells(grid[example], function (ex, c) {
    var withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCellElement(grid[index - 1], c), GridRow.getCellElement(grid[index], c));
    var ret = withinSpan ? GridRow.getCell(grid[index], c) : Structs.elementnew(substitution(ex.element(), comparator), true);
    return ret;
  });

  return before.concat([ between ]).concat(after);
};

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the column index)
// index is the insert position (at - or after - example) (the column index)
var insertColumnAt = function (grid, index, example, comparator, substitution) {
  return Arr.map(grid, function (row) {
    var withinSpan = index > 0 && index < GridRow.cellLength(row) && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
    var sub = withinSpan ? GridRow.getCell(row, index) : Structs.elementnew(substitution(GridRow.getCellElement(row, example), comparator), true);
    return GridRow.addCell(row, index, sub);
  });
};

// substitution :: (item, comparator) -> item
// Returns:
// - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
//   new cell follows, and is empty), and
// - the other cells in that column set to span the split cell.
var splitCellIntoColumns = function (grid, exampleRow, exampleCol, comparator, substitution) {
  var index = exampleCol + 1; // insert after
  return Arr.map(grid, function (row, i) {
    var isTargetCell = (i === exampleRow);
    var sub = isTargetCell ? Structs.elementnew(substitution(GridRow.getCellElement(row, exampleCol), comparator), true) : GridRow.getCell(row, exampleCol);
    return GridRow.addCell(row, index, sub);
  });
};

// substitution :: (item, comparator) -> item
// Returns:
// - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
//   new cell below, and is empty), and
// - the other cells in that row set to span the split cell.
var splitCellIntoRows = function (grid, exampleRow, exampleCol, comparator, substitution) {
  var index = exampleRow + 1; // insert after
  var before = grid.slice(0, index);
  var after = grid.slice(index);

  var between = GridRow.mapCells(grid[exampleRow], function (ex, i) {
    var isTargetCell = (i === exampleCol);
    return isTargetCell ? Structs.elementnew(substitution(ex.element(), comparator), true) : ex;
  });

  return before.concat([ between ]).concat(after);
};

var deleteColumnsAt = function (grid, start, finish) {
  var rows = Arr.map(grid, function (row) {
    var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
    return Structs.rowcells(cells, row.section());
  });
  // We should filter out rows that have no columns for easy deletion
  return Arr.filter(rows, function (row) {
    return row.cells().length > 0;
  });
};

var deleteRowsAt = function (grid, start, finish) {
  return grid.slice(0, start).concat(grid.slice(finish + 1));
};

export default {
  insertRowAt: insertRowAt,
  insertColumnAt: insertColumnAt,
  splitCellIntoColumns: splitCellIntoColumns,
  splitCellIntoRows: splitCellIntoRows,
  deleteRowsAt: deleteRowsAt,
  deleteColumnsAt: deleteColumnsAt
};