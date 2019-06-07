import { Arr } from '@ephox/katamari';
import * as Structs from '../api/Structs';
import GridRow from '../model/GridRow';
import { Element } from '@ephox/sugar';

type CompElm = (e1: Element, e2: Element) => boolean;
type Subst = (element: Element, comparator: CompElm) => Element;

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the row index)
// index is the insert position (at - or after - example) (the row index)
const insertRowAt = function (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst) {
  const before = grid.slice(0, index);
  const after = grid.slice(index);

  const between = GridRow.mapCells(grid[example], function (ex, c) {
    const withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCellElement(grid[index - 1], c), GridRow.getCellElement(grid[index], c));
    const ret = withinSpan ? GridRow.getCell(grid[index], c) : Structs.elementnew(substitution(ex.element(), comparator), true);
    return ret;
  });

  return before.concat([ between ]).concat(after);
};

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the column index)
// index is the insert position (at - or after - example) (the column index)
const insertColumnAt = function (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst) {
  return Arr.map(grid, function (row) {
    const withinSpan = index > 0 && index < GridRow.cellLength(row) && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
    const sub = withinSpan ? GridRow.getCell(row, index) : Structs.elementnew(substitution(GridRow.getCellElement(row, example), comparator), true);
    return GridRow.addCell(row, index, sub);
  });
};

// substitution :: (item, comparator) -> item
// Returns:
// - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
//   new cell follows, and is empty), and
// - the other cells in that column set to span the split cell.
const splitCellIntoColumns = function (grid: Structs.RowCells[], exampleRow: number, exampleCol: number, comparator: CompElm, substitution: Subst) {
  const index = exampleCol + 1; // insert after
  return Arr.map(grid, function (row, i) {
    const isTargetCell = (i === exampleRow);
    const sub = isTargetCell ? Structs.elementnew(substitution(GridRow.getCellElement(row, exampleCol), comparator), true) : GridRow.getCell(row, exampleCol);
    return GridRow.addCell(row, index, sub);
  });
};

// substitution :: (item, comparator) -> item
// Returns:
// - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
//   new cell below, and is empty), and
// - the other cells in that row set to span the split cell.
const splitCellIntoRows = function (grid: Structs.RowCells[], exampleRow: number, exampleCol: number, comparator: CompElm, substitution: Subst) {
  const index = exampleRow + 1; // insert after
  const before = grid.slice(0, index);
  const after = grid.slice(index);

  const between = GridRow.mapCells(grid[exampleRow], function (ex, i) {
    const isTargetCell = (i === exampleCol);
    return isTargetCell ? Structs.elementnew(substitution(ex.element(), comparator), true) : ex;
  });

  return before.concat([ between ]).concat(after);
};

const deleteColumnsAt = function (grid: Structs.RowCells[], start: number, finish: number) {
  const rows = Arr.map(grid, function (row) {
    const cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
    return Structs.rowcells(cells, row.section());
  });
  // We should filter out rows that have no columns for easy deletion
  return Arr.filter(rows, function (row) {
    return row.cells().length > 0;
  });
};

const deleteRowsAt = function (grid: Structs.RowCells[], start: number, finish: number) {
  return grid.slice(0, start).concat(grid.slice(finish + 1));
};

export default {
  insertRowAt,
  insertColumnAt,
  splitCellIntoColumns,
  splitCellIntoRows,
  deleteRowsAt,
  deleteColumnsAt
};