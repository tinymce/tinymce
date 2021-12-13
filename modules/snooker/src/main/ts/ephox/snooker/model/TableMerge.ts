import { Arr, Fun, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { SimpleGenerators } from '../api/Generators';
import * as Structs from '../api/Structs';
import * as MergingOperations from '../operate/MergingOperations';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import { CompElm } from '../util/TableTypes';
import * as Fitment from './Fitment';
import * as GridRow from './GridRow';

const isSpanning = (grid: Structs.RowCells[], row: number, col: number, comparator: CompElm): boolean => {
  const candidate = GridRow.getCell(grid[row], col);
  const matching = Fun.curry(comparator, candidate.element);
  const currentRow = grid[row];

  // sanity check, 1x1 has no spans
  return grid.length > 1 && GridRow.cellLength(currentRow) > 1 &&
    (
      // search left, if we're not on the left edge
      // search down, if we're not on the bottom edge
      (col > 0 && matching(GridRow.getCellElement(currentRow, col - 1))) ||
      // search right, if we're not on the right edge
      (col < currentRow.cells.length - 1 && matching(GridRow.getCellElement(currentRow, col + 1))) ||
      // search up, if we're not on the top edge
      (row > 0 && matching(GridRow.getCellElement(grid[row - 1], col))) ||
      (row < grid.length - 1 && matching(GridRow.getCellElement(grid[row + 1], col)))
    );
};

const mergeTables = (
  startAddress: Structs.Address,
  gridA: Structs.RowCells[],
  gridBRows: Structs.RowCells<HTMLTableRowElement>[],
  generator: SimpleGenerators,
  comparator: CompElm,
  lockedColumns: number[]
): Structs.RowCells[] => {
  // Assumes
  //  - gridA is square and gridB is square
  const startRow = startAddress.row;
  const startCol = startAddress.column;
  const mergeHeight = gridBRows.length;
  const mergeWidth = GridRow.cellLength(gridBRows[0]);
  const endRow = startRow + mergeHeight;
  const endCol = startCol + mergeWidth + lockedColumns.length;
  const lockedColumnObj = Arr.mapToObject(lockedColumns, Fun.always);
  // embrace the mutation - I think this is easier to follow? To discuss.
  for (let r = startRow; r < endRow; r++) {
    let skippedCol = 0;
    for (let c = startCol; c < endCol; c++) {
      if (lockedColumnObj[c]) {
        skippedCol++;
        continue;
      }

      if (isSpanning(gridA, r, c, comparator)) {
        // mutation within mutation, it's mutatception
        MergingOperations.unmerge(gridA, GridRow.getCellElement(gridA[r], c), comparator, generator.cell);
      }
      const gridBColIndex = c - startCol - skippedCol;
      const newCell = GridRow.getCell(gridBRows[r - startRow], gridBColIndex);
      // This can't be a col element at this point so we can cast it to a cell
      const newCellElm = newCell.element as SugarElement<HTMLTableCellElement>;
      const replacement = generator.replace(newCellElm);
      GridRow.mutateCell(gridA[r], c, Structs.elementnew(replacement, true, newCell.isLocked));
    }
  }
  return gridA;
};

const getValidStartAddress = (currentStartAddress: Structs.Address, grid: Structs.RowCells[], lockedColumns: number[]): Structs.Address => {
  const gridColLength = GridRow.cellLength(grid[0]);
  /*
    When we paste from a table without colgroups to a table that has them, we need to ensure we are inserting them at
    the correct row index (the `col`s are treated as cells in the Structs.RowCells array).

    To do this, we get the number of `col`s in the destination table and add that to the startAddress row.
  */
  const adjustedRowAddress = GridRow.extractGridDetails(grid).cols.length + currentStartAddress.row;
  const possibleColAddresses = Arr.range(gridColLength - currentStartAddress.column, (num) => num + currentStartAddress.column);
  // Find a starting column address that isn't a locked column
  const validColAddress = Arr.find(possibleColAddresses, (num) => Arr.forall(lockedColumns, (col) => col !== num)).getOr(gridColLength - 1);
  return {
    row: adjustedRowAddress,
    column: validColAddress
  };
};

const getLockedColumnsWithinBounds = (startAddress: Structs.Address, rows: Structs.RowCells<HTMLTableRowElement>[], lockedColumns: number[]) =>
  Arr.filter(lockedColumns, (colNum) => colNum >= startAddress.column && colNum <= GridRow.cellLength(rows[0]) + startAddress.column);

const merge = (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: CompElm): Result<Structs.RowCells[], string> => {
  const lockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(gridA);
  const validStartAddress = getValidStartAddress(startAddress, gridA, lockedColumns);
  /*
    We always remove the cols (extract the rows) from the table being pasted. This ensures that if we are pasting from a table with colgroups into a table
    without them, we don't insert the `col` elements as if they were `td`s
  */
  const gridBRows = GridRow.extractGridDetails(gridB).rows;
  const lockedColumnsWithinBounds = getLockedColumnsWithinBounds(validStartAddress, gridBRows, lockedColumns);

  const result = Fitment.measure(validStartAddress, gridA, gridBRows);
  /*
    Need to subtract extra delta for locked columns between startAddress and the startAddress + gridB column count as
    locked column cells cannot be merged into. Therefore, extra column cells need to be added to gridA to allow gridB cells to be merged
  */
  return result.map((diff) => {
    const delta: Fitment.Delta = {
      ...diff,
      colDelta: diff.colDelta - lockedColumnsWithinBounds.length
    };

    const fittedGrid = Fitment.tailor(gridA, delta, generator);

    // Need to recalculate lockedColumnsWithinBounds as tailoring may have inserted columns before last locked column which changes the locked index
    const newLockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(fittedGrid);
    const newLockedColumnsWithinBounds = getLockedColumnsWithinBounds(validStartAddress, gridBRows, newLockedColumns);
    return mergeTables(validStartAddress, fittedGrid, gridBRows, generator, comparator, newLockedColumnsWithinBounds);
  });
};

const insertCols = (index: number, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: CompElm): Structs.RowCells[] => {
  MergingOperations.splitCols(gridA, index, comparator, generator.cell);

  const delta = Fitment.measureHeight(gridB, gridA);
  const fittedNewGrid = Fitment.tailor(gridB, delta, generator);

  const secondDelta = Fitment.measureHeight(gridA, fittedNewGrid);
  const fittedOldGrid = Fitment.tailor(gridA, secondDelta, generator);

  return Arr.map(fittedOldGrid, (gridRow, i) => {
    return GridRow.addCells(gridRow, index, fittedNewGrid[i].cells);
  });
};

/*
  Inserting rows with locked columns
  - Tailor gridA first (this needs to be done first as the position of the locked columns may change when tailoring gridA and the location of the locked columns needs to be stable before tailoring gridB)
    - measure delta between gridA and gridB (pasted rows) - if negative colDelta, gridA needs extra columns added to match gridB
    - need to calculate how many columns in gridB cannot be directly inserted into gridA - this is how many extra columns need to be added to gridA (this consideres the fact locked column cannot be inserted into)
      - nonLockedGridA + lockedGridA - gridB = colDelta (By subtracting locked column count, can get required diff)
    - tailor gridA by adding the required extra columns if necessary either at the end of gridA or before the last column depending on whether it is locked
  - Recalculate where the locked columns are in gridA after tailoring
  - Measure and determine if extra columns need to be added to gridB (locked columns should not count towards the delta as colFilling (adding extra columns) for locked columns is handled separately)
  - Do a lockedColFill on gridB
  - Tailor gridB by adding extra columns to end of gridB if required
*/

const insertRows = (index: number, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: CompElm): Structs.RowCells[] => {
  MergingOperations.splitRows(gridA, index, comparator, generator.cell);

  const locked = LockedColumnUtils.getLockedColumnsFromGrid(gridA);
  const diff = Fitment.measureWidth(gridA, gridB);
  const delta: Fitment.Delta = {
    ...diff,
    colDelta: diff.colDelta - locked.length
  };
  const fittedOldGrid = Fitment.tailor(gridA, delta, generator);
  const { cols: oldCols, rows: oldRows } = GridRow.extractGridDetails(fittedOldGrid);

  const newLocked = LockedColumnUtils.getLockedColumnsFromGrid(fittedOldGrid);
  const secondDiff = Fitment.measureWidth(gridB, gridA);
  // Don't want the locked columns to count towards to the colDelta as column filling for locked columns is handled separately
  const secondDelta: Fitment.Delta = {
    ...secondDiff,
    colDelta: secondDiff.colDelta + newLocked.length
  };
  const fittedGridB = Fitment.lockedColFill(gridB, generator, newLocked);
  const fittedNewGrid = Fitment.tailor(fittedGridB, secondDelta, generator);

  return [
    ...oldCols,
    ...oldRows.slice(0, index),
    ...fittedNewGrid,
    ...oldRows.slice(index, oldRows.length)
  ];
};

export {
  merge,
  insertCols,
  insertRows
};
