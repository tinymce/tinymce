import { Arr } from '@ephox/katamari';

import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';
import { CompElm, Subst } from '../util/TableTypes';

type CloneCell = (elem: Structs.ElementNew<HTMLTableCellElement>, index: number) => Structs.ElementNew<HTMLTableCellElement>;

const cloneRow = (row: Structs.RowCells<HTMLTableRowElement>, cloneCell: CloneCell, comparator: CompElm, substitution: Subst) =>
  GridRow.clone(row, (elem) => substitution(elem, comparator), cloneCell);

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the row index)
// index is the insert position (at - or after - example) (the row index)
const insertRowAt = (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const { rows, cols } = GridRow.extractGridDetails(grid);
  const before = rows.slice(0, index);
  const after = rows.slice(index);

  const newRow = cloneRow(rows[example], (ex, c) => {
    const withinSpan = index > 0 && index < rows.length && comparator(GridRow.getCellElement(rows[index - 1], c), GridRow.getCellElement(rows[index], c));
    const ret = withinSpan ? GridRow.getCell(rows[index], c) : Structs.elementnew(substitution(ex.element, comparator), true, ex.isLocked);
    return ret;
  }, comparator, substitution);

  return [
    ...cols,
    ...before,
    newRow,
    ...after
  ];
};

const getElementFor = (row: Structs.RowCells, column: number, section: string, withinSpan: boolean, example: number, comparator: CompElm, substitution: Subst): Structs.ElementNew => {
  if (section === 'colgroup' || !withinSpan) {
    const cell = GridRow.getCell(row, example);
    // locked is explicitly set to false so the newly inserted column doesn't inherit example column locked state
    return Structs.elementnew(substitution(cell.element, comparator), true, false);
  } else {
    return GridRow.getCell(row, column);
  }
};

// substitution :: (item, comparator) -> item
// example is the location of the cursor (the column index)
// index is the insert position (at - or after - example) (the column index)
const insertColumnAt = (grid: Structs.RowCells[], index: number, example: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] =>
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
const splitCellIntoColumns = (grid: Structs.RowCells[], exampleRow: number, exampleCol: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const index = exampleCol + 1; // insert after
  return Arr.map(grid, (row, i) => {
    const isTargetCell = (i === exampleRow);
    const cell = GridRow.getCell(row, exampleCol);
    const sub = isTargetCell ? Structs.elementnew(substitution(cell.element, comparator), true, cell.isLocked) : cell;
    return GridRow.addCell(row, index, sub);
  });
};

// substitution :: (item, comparator) -> item
// Returns:
// - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
//   new cell below, and is empty), and
// - the other cells in that row set to span the split cell.
const splitCellIntoRows = (grid: Structs.RowCells[], exampleRow: number, exampleCol: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const { rows, cols } = GridRow.extractGridDetails(grid);
  const index = exampleRow + 1; // insert after
  const before = rows.slice(0, index);
  const after = rows.slice(index);

  const newRow = cloneRow(rows[exampleRow], (ex, i) => {
    const isTargetCell = (i === exampleCol);
    return isTargetCell ? Structs.elementnew(substitution(ex.element, comparator), true, ex.isLocked) : ex;
  }, comparator, substitution);

  return [
    ...cols,
    ...before,
    newRow,
    ...after
  ];
};

const deleteColumnsAt = (grid: Structs.RowCells[], columns: number[]): Structs.RowCells[] =>
  Arr.bind(grid, (row) => {
    const existingCells = row.cells;
    const cells = Arr.foldr(columns, (acc, column) => column >= 0 && column < acc.length ? acc.slice(0, column).concat(acc.slice(column + 1)) : acc, existingCells);
    return cells.length > 0 ? [ Structs.rowcells(row.element, cells, row.section, row.isNew) ] : [];
  });

const deleteRowsAt = (grid: Structs.RowCells[], start: number, finish: number): Structs.RowCells[] => {
  const { rows, cols } = GridRow.extractGridDetails(grid);
  return [
    ...cols,
    ...rows.slice(0, start),
    ...rows.slice(finish + 1)
  ];
};

export {
  insertRowAt,
  insertColumnAt,
  splitCellIntoColumns,
  splitCellIntoRows,
  deleteRowsAt,
  deleteColumnsAt
};
