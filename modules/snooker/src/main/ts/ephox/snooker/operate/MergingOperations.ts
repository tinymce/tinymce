import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';
import { CellElement, CompElm } from '../util/TableTypes';

type Subst = () => SugarElement<HTMLTableCellElement>;

// substitution: () -> item
const merge = (grid: Structs.RowCells[], bounds: Structs.Bounds, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const rows = GridRow.extractGridDetails(grid).rows;
  // Mutating. Do we care about the efficiency gain?
  if (rows.length === 0) {
    return grid;
  }
  for (let i = bounds.startRow; i <= bounds.finishRow; i++) {
    for (let j = bounds.startCol; j <= bounds.finishCol; j++) {
      // We can probably simplify this again now that we aren't reusing merge.
      const row = rows[i];
      const isLocked = GridRow.getCell(row, j).isLocked;
      GridRow.mutateCell(row, j, Structs.elementnew(substitution(), false, isLocked));
    }
  }
  return grid;
};

// substitution: () -> item
const unmerge = (grid: Structs.RowCells[], target: SugarElement<HTMLElement>, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const rows = GridRow.extractGridDetails(grid).rows;
  // Mutating. Do we care about the efficiency gain?
  let first = true;
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < GridRow.cellLength(rows[0]); j++) {
      const row = rows[i];
      const currentCell = GridRow.getCell(row, j);
      const currentCellElm = currentCell.element;
      const isToReplace = comparator(currentCellElm, target);

      if (isToReplace && !first) {
        GridRow.mutateCell(row, j, Structs.elementnew(substitution(), true, currentCell.isLocked));
      } else if (isToReplace) {
        first = false;
      }
    }
  }
  return grid;
};

const uniqueCells = <T extends CellElement>(row: Structs.ElementNew<T>[], comparator: CompElm): Structs.ElementNew<T>[] => {
  return Arr.foldl(row, (rest, cell) => {
    return Arr.exists(rest, (currentCell) => {
      return comparator(currentCell.element, cell.element);
    }) ? rest : rest.concat([ cell ]);
  }, [] as Structs.ElementNew<T>[]);
};

const splitCols = (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  // We don't need to split rows if we're inserting at the first or last row of the old table
  if (index > 0 && index < grid[0].cells.length) {
    Arr.each(grid, (row) => {
      const prevCell = row.cells[index - 1];
      let offset = 0;
      const substitute = substitution();

      while (row.cells.length > index + offset && comparator(prevCell.element, row.cells[index + offset].element)) {
        GridRow.mutateCell(row, index + offset, Structs.elementnew(substitute, true, row.cells[index + offset].isLocked));
        offset++;
      }
    });
  }

  return grid;
};

const splitRows = (grid: Structs.RowCells[], index: number, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  // We don't need to split rows if we're inserting at the first or last row of the old table
  const rows = GridRow.extractGridDetails(grid).rows;
  if (index > 0 && index < rows.length) {
    const rowPrevCells = rows[index - 1].cells;
    const cells = uniqueCells(rowPrevCells, comparator);
    Arr.each(cells, (cell) => {
      // only make a sub when we have to
      let replacement = Optional.none<SugarElement<HTMLTableCellElement>>();
      for (let i = index; i < rows.length; i++) {
        for (let j = 0; j < GridRow.cellLength(rows[0]); j++) {
          const row = rows[i];
          const current = GridRow.getCell(row, j);
          const isToReplace = comparator(current.element, cell.element);

          if (isToReplace) {
            if (replacement.isNone()) {
              replacement = Optional.some(substitution());
            }
            replacement.each((sub) => {
              GridRow.mutateCell(row, j, Structs.elementnew(sub, true, current.isLocked));
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
