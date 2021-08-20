import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { TableSection } from '../api/TableSection';
import * as GridRow from '../model/GridRow';

type CompElm = (e1: SugarElement, e2: SugarElement) => boolean;
type Subst = (element: SugarElement, comparator: CompElm) => SugarElement;
type CellReplacer = (cell: Structs.ElementNew, comparator: CompElm, substitute: Subst) => Structs.ElementNew;

const replace = (cell: Structs.ElementNew, comparator: CompElm, substitute: Subst) =>
  Structs.elementnew(substitute(cell.element, comparator), true, cell.isLocked);

// substitution :: (item, comparator) -> item
const replaceIn = (grid: Structs.RowCells[], targets: Structs.ElementNew[], comparator: CompElm, substitute: Subst, replacer: CellReplacer): Structs.RowCells[] => {
  const isTarget = (cell: Structs.ElementNew) => {
    return Arr.exists(targets, (target) => {
      return comparator(cell.element, target.element);
    });
  };

  return Arr.map(grid, (row) => {
    return GridRow.mapCells(row, (cell) => {
      return isTarget(cell) ? replacer(cell, comparator, substitute) : cell;
    });
  });
};

const notStartRow = (grid: Structs.RowCells[], rowIndex: number, colIndex: number, comparator: CompElm): boolean => {
  return GridRow.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCellElement(grid[rowIndex - 1], colIndex), GridRow.getCellElement(grid[rowIndex], colIndex)));
};

const notStartColumn = (row: Structs.RowCells, index: number, comparator: CompElm): boolean => {
  return index > 0 && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
};

// substitution :: (item, comparator) -> item
const replaceColumn = (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  // Make this efficient later.
  const rows = GridRow.extractGridDetails(grid).rows;
  const targets = Arr.bind(rows, (row, i) => {
    // check if already added.
    const alreadyAdded = notStartRow(rows, i, index, comparator) || notStartColumn(row, index, comparator);
    return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
  });

  return replaceIn(grid, targets, comparator, substitution, replace);
};

// substitution :: (item, comparator) -> item
const replaceRow = (grid: Structs.RowCells[], index: number, section: Structs.Section, comparator: CompElm, substitution: Subst, tableSection: TableSection): Structs.RowCells[] => {
  const { cols, rows } = GridRow.extractGridDetails(grid);
  const targetRow = rows[index];
  const targets = Arr.bind(targetRow.cells, (item, i) => {
    // Check that we haven't already added this one.
    const alreadyAdded = notStartRow(rows, index, i, comparator) || notStartColumn(targetRow, i, comparator);
    return alreadyAdded ? [] : [ item ];
  });

  // Transform and replace the target row
  // TODO: TINY-7776: This doesn't deal with rowspans which can break the layout when moving to a new section
  const newRows = [ ...rows ];
  newRows[index] = tableSection.transformRow(targetRow, section);
  return replaceIn(cols.concat(newRows), targets, comparator, substitution, tableSection.transformCell);
};

const replaceCell = (grid: Structs.RowCells[], rowIndex: number, columnIndex: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const targetRow = rows[rowIndex];
  const targetCell = GridRow.getCell(targetRow, columnIndex);
  return replaceIn(grid, [ targetCell ], comparator, substitution, replace);
};

export {
  replaceColumn,
  replaceRow,
  replaceCell
};
