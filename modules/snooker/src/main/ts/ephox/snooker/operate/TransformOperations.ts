import { Arr } from '@ephox/katamari';
import Structs from '../api/Structs';
import GridRow from '../model/GridRow';

// substitution :: (item, comparator) -> item
const replaceIn = function (grid, targets, comparator, substitution) {
  const isTarget = function (cell) {
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

const notStartRow = function (grid, rowIndex, colIndex, comparator) {
  return GridRow.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCellElement(grid[rowIndex - 1], colIndex), GridRow.getCellElement(grid[rowIndex], colIndex)));
};

const notStartColumn = function (row, index, comparator) {
  return index > 0 && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));
};

// substitution :: (item, comparator) -> item
const replaceColumn = function (grid, index, comparator, substitution) {
  // Make this efficient later.
  const targets = Arr.bind(grid, function (row, i) {
    // check if already added.
    const alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
    return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
  });

  return replaceIn(grid, targets, comparator, substitution);
};

// substitution :: (item, comparator) -> item
const replaceRow = function (grid, index, comparator, substitution) {
  const targetRow = grid[index];
  const targets = Arr.bind(targetRow.cells(), function (item, i) {
    // Check that we haven't already added this one.
    const alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
    return alreadyAdded ? [] : [ item ];
  });

  return replaceIn(grid, targets, comparator, substitution);
};

export default {
  replaceColumn,
  replaceRow
};