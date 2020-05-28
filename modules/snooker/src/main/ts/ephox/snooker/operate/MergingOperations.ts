import { Arr, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';

type CompElm = (e1: Element, e2: Element) => boolean;
type Subst = () => Element;

// substitution: () -> item
const merge = function (grid: Structs.RowCells[], bounds: Structs.Bounds, comparator: CompElm, substitution: Subst) {
  // Mutating. Do we care about the efficiency gain?
  if (grid.length === 0) {
    return grid;
  }
  for (let i = bounds.startRow(); i <= bounds.finishRow(); i++) {
    for (let j = bounds.startCol(); j <= bounds.finishCol(); j++) {
      // We can probably simplify this again now that we aren't reusing merge.
      GridRow.mutateCell(grid[i], j, Structs.elementnew(substitution(), false));
    }
  }
  return grid;
};

// substitution: () -> item
const unmerge = function (grid: Structs.RowCells[], target: Element, comparator: CompElm, substitution: Subst) {
  // Mutating. Do we care about the efficiency gain?
  let first = true;
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < GridRow.cellLength(grid[0]); j++) {
      const current = GridRow.getCellElement(grid[i], j);
      const isToReplace = comparator(current, target);

      if (isToReplace === true && first === false) {
        GridRow.mutateCell(grid[i], j, Structs.elementnew(substitution(), true));
      } else if (isToReplace === true) {
        first = false;
      }
    }
  }
  return grid;
};

const uniqueCells = function (row: Structs.ElementNew[], comparator: CompElm) {
  return Arr.foldl(row, function (rest, cell) {
    return Arr.exists(rest, function (currentCell) {
      return comparator(currentCell.element(), cell.element());
    }) ? rest : rest.concat([ cell ]);
  }, [] as Structs.ElementNew[]);
};

const splitCols = (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst) => {
  // We don't need to split rows if we're inserting at the first or last row of the old table
  if (index > 0 && index < grid[0].cells().length) {
    Arr.each(grid, (row) => {
      const prevCell = row.cells()[index - 1];
      const current = row.cells()[index];
      const isToReplace = comparator(current.element(), prevCell.element());

      if (isToReplace) {
        GridRow.mutateCell(row, index, Structs.elementnew(substitution(), true));
      }
    });
  }

  return grid;
};

const splitRows = function (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst) {
  // We don't need to split rows if we're inserting at the first or last row of the old table
  if (index > 0 && index < grid.length) {
    const rowPrevCells = grid[index - 1].cells();
    const cells = uniqueCells(rowPrevCells, comparator);
    Arr.each(cells, function (cell) {
      // only make a sub when we have to
      let replacement = Option.none<Element>();
      for (let i = index; i < grid.length; i++) {
        for (let j = 0; j < GridRow.cellLength(grid[0]); j++) {
          const current = grid[i].cells()[j];
          const isToReplace = comparator(current.element(), cell.element());

          if (isToReplace) {
            if (replacement.isNone()) {
              replacement = Option.some(substitution());
            }
            replacement.each(function (sub) {
              GridRow.mutateCell(grid[i], j, Structs.elementnew(sub, true));
            });
          }
        }
      }
    });
  }

  return grid;
};

export {
  merge,
  unmerge,
  splitCols,
  splitRows
};
