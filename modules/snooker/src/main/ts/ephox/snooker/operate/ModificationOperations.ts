import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';

type CompElm = (e1: SugarElement, e2: SugarElement) => boolean;
type Subst = (element: SugarElement, comparator: CompElm) => SugarElement;

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the row index)
// index is the insert position (at - or after - example) (the row index)
const insertRowAt = function (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst) {
  const { rows, cols } = GridRow.extractGridDetails(grid);
  const before = rows.slice(0, index);
  const after = rows.slice(index);

  const between = GridRow.mapCells(rows[example], function (ex, c) {
    const withinSpan = index > 0 && index < rows.length && comparator(GridRow.getCellElement(rows[index - 1], c), GridRow.getCellElement(rows[index], c));
    const ret = withinSpan ? GridRow.getCell(rows[index], c) : Structs.elementnew(substitution(ex.element, comparator), true);
    return ret;
  });

  return cols.concat(before).concat([ between ]).concat(after);
};

const getElementFor = (row: Structs.RowCells, column: number, section: string, withinSpan: boolean, example: number, comparator: CompElm, substitution: Subst): Structs.ElementNew => {
  if (section === 'colgroup' || !withinSpan) {
    return Structs.elementnew(substitution(GridRow.getCellElement(row, example), comparator), true);
  } else {
    return GridRow.getCell(row, column);
  }
};

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the column index)
// index is the insert position (at - or after - example) (the column index)
const insertColumnAt = (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst) =>
  Arr.map(grid, (row) => {
    const withinSpan = index > 0 && index < GridRow.cellLength(row) && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
    const sub = getElementFor(row, index, row.section, withinSpan, example, comparator, substitution);

    return GridRow.addCell(row, index, sub);
  });

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
  const { rows, cols } = GridRow.extractGridDetails(grid);
  const index = exampleRow + 1; // insert after
  const before = rows.slice(0, index);
  const after = rows.slice(index);

  const between = GridRow.mapCells(rows[exampleRow], function (ex, i) {
    const isTargetCell = (i === exampleCol);
    return isTargetCell ? Structs.elementnew(substitution(ex.element, comparator), true) : ex;
  });

  return cols.concat(before).concat([ between ]).concat(after);
};

const deleteColumnsAt = function (grid: Structs.RowCells[], start: number, finish: number) {
  const rows = Arr.map(grid, function (row) {
    const cells = row.cells.slice(0, start).concat(row.cells.slice(finish + 1));
    return Structs.rowcells(cells, row.section);
  });
  // We should filter out rows that have no columns for easy deletion
  return Arr.filter(rows, function (row) {
    return row.cells.length > 0;
  });
};

const deleteRowsAt = function (grid: Structs.RowCells[], start: number, finish: number) {
  const { rows, cols } = GridRow.extractGridDetails(grid);
  return cols.concat(rows.slice(0, start)).concat(rows.slice(finish + 1));
};

export {
  insertRowAt,
  insertColumnAt,
  splitCellIntoColumns,
  splitCellIntoRows,
  deleteRowsAt,
  deleteColumnsAt
};
