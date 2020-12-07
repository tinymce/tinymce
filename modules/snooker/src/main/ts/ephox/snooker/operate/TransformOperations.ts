import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';

type CompElm = (e1: SugarElement, e2: SugarElement) => boolean;
type Subst = (element: SugarElement, comparator: CompElm) => SugarElement;

// substitution :: (item, comparator) -> item
const replaceIn = function (grid: Structs.RowCells[], targets: Structs.ElementNew[], comparator: CompElm, substitution: Subst): Structs.RowCells[] {
  const isTarget = function (cell: Structs.ElementNew) {
    return Arr.exists(targets, function (target) {
      return comparator(cell.element, target.element);
    });
  };

  return Arr.map(grid, function (row) {
    return GridRow.mapCells(row, function (cell) {
      return isTarget(cell) ? Structs.elementnew(substitution(cell.element, comparator), true) : cell;
    });
  });
};

const notStartRow = function (grid: Structs.RowCells[], rowIndex: number, colIndex: number, comparator: CompElm): boolean {
  return GridRow.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCellElement(grid[rowIndex - 1], colIndex), GridRow.getCellElement(grid[rowIndex], colIndex)));
};

const notStartColumn = function (row: Structs.RowCells, index: number, comparator: CompElm): boolean {
  return index > 0 && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
};

// substitution :: (item, comparator) -> item
const replaceColumn = function (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] {
  // Make this efficient later.
  const targets = Arr.bind(grid, function (row, i) {
    // check if already added.
    const alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
    return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
  });

  return replaceIn(grid, targets, comparator, substitution);
};

// substitution :: (item, comparator) -> item
const replaceRow = function (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] {
  const rows = GridRow.extractGridDetails(grid).rows;
  const targetRow = rows[index];
  const targets = Arr.bind(targetRow.cells, function (item, i) {
    // Check that we haven't already added this one.
    const alreadyAdded = notStartRow(rows, index, i, comparator) || notStartColumn(targetRow, i, comparator);
    return alreadyAdded ? [] : [ item ];
  });

  return replaceIn(grid, targets, comparator, substitution);
};

export {
  replaceColumn,
  replaceRow
};
