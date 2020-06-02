import { Arr } from '@ephox/katamari';
import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';
import { Element } from '@ephox/sugar';

type CompElm = (e1: Element, e2: Element) => boolean;
type Subst = (element: Element, comparator: CompElm) => Element;

// substitution :: (item, comparator) -> item
const replaceIn = function (grid: Structs.RowCells[], targets: Structs.ElementNew[], comparator: CompElm, substitution: Subst) {
  const isTarget = function (cell: Structs.ElementNew) {
    return Arr.exists(targets, function (target) {
      return comparator(cell.element(), target.element());
    });
  };

  return Arr.map(grid, function (row) {
    return GridRow.mapCells(row, function (cell) {
      return isTarget(cell) ? Structs.elementnew(substitution(cell.element(), comparator), true) : cell;
    });
  });
};

const notStartRow = function (grid: Structs.RowCells[], rowIndex: number, colIndex: number, comparator: CompElm) {
  return GridRow.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCellElement(grid[rowIndex - 1], colIndex), GridRow.getCellElement(grid[rowIndex], colIndex)));
};

const notStartColumn = function (row: Structs.RowCells, index: number, comparator: CompElm) {
  return index > 0 && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
};

// substitution :: (item, comparator) -> item
const replaceColumn = function (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst) {
  // Make this efficient later.
  const targets = Arr.bind(grid, function (row, i) {
    // check if already added.
    const alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
    return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
  });

  return replaceIn(grid, targets, comparator, substitution);
};

const replaceColumns = function (grid: Structs.RowCells[], indices: number[], comparator: CompElm, substitution: Subst) {
  const allTargets = Arr.map((indices), (index) => {
    // Make this efficient later.
    return Arr.bind(grid, function (row, i) {
      // check if already added.
      const alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
      return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
    });
  });

  return replaceIn(grid, Arr.flatten(allTargets), comparator, substitution);
};

// substitution :: (item, comparator) -> item
const replaceRow = function (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst) {
  return replaceRows(grid, [ index ], comparator, substitution);
};

const replaceRows = (grid: Structs.RowCells[], indices: number[], comparator: CompElm, substitution: Subst) => {
  const allTargets = Arr.map((indices), (index) => {
    const targetRow = grid[index];
    return Arr.bind(targetRow.cells(), function (item, i) {
      // Check that we haven't already added this one.
      const alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
      return alreadyAdded ? [] : [ item ];
    });
  });
  

  return replaceIn(grid, Arr.flatten(allTargets), comparator, substitution);
};

const changeSections = (grid: Structs.RowCells[], indices: number[], newSection: Structs.Section) => {
  return Arr.map(grid, (rowCell, i) => {
    return Arr.contains(indices, i) ? GridRow.setSection(rowCell, newSection) : rowCell;
  });
};

export {
  replaceColumn,
  replaceColumns,
  replaceRow,
  replaceRows,
  changeSections
};
