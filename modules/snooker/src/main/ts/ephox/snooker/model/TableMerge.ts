import { Arr, Fun, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { SimpleGenerators } from '../api/Generators';
import * as Structs from '../api/Structs';
import * as MergingOperations from '../operate/MergingOperations';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import * as Fitment from './Fitment';
import * as GridRow from './GridRow';

const isSpanning = (grid: Structs.RowCells[], row: number, col: number, comparator: (a: SugarElement, b: SugarElement) => boolean): boolean => {
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

const mergeTables = (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: SugarElement, b: SugarElement) => boolean, lockedColumns: number[]): Structs.RowCells[] => {
  // Assumes
  //  - gridA is square and gridB is square
  const startRow = startAddress.row;
  const startCol = startAddress.column;
  const mergeHeight = gridB.length;
  const mergeWidth = GridRow.cellLength(gridB[0]);
  const endRow = startRow + mergeHeight;
  const endCol = startCol + mergeWidth + lockedColumns.length;
  const lockedColumnObj = Arr.mapToObject(lockedColumns, Fun.always);
  let skipped = 0;
  // embrace the mutation - I think this is easier to follow? To discuss.
  for (let r = startRow; r < endRow; r++) {
    skipped = 0;
    for (let c = startCol; c < endCol; c++) {
      if (lockedColumnObj[c]) {
        skipped++;
        continue;
      }

      if (isSpanning(gridA, r, c, comparator)) {
        // mutation within mutation, it's mutatception
        MergingOperations.unmerge(gridA, GridRow.getCellElement(gridA[r], c), comparator, generator.cell);
      }
      const newCell = GridRow.getCell(gridB[r - startRow], c - startCol - skipped);
      const newCellElm = newCell.element;
      const replacement = generator.replace(newCellElm);
      GridRow.mutateCell(gridA[r], c, Structs.elementnew(replacement, true, newCell.isLocked));
    }
  }
  return gridA;
};

const getValidStartAddress = (currentStartAddress: Structs.Address, grid: Structs.RowCells[], lockedColumns: number[]): Structs.Address => {
  const gridColLength = GridRow.cellLength(grid[0]);
  const possibleColAddresses = Arr.range(gridColLength - currentStartAddress.column, (num) => num + currentStartAddress.column);
  // Find a starting column address that isn't a locked column
  const validColAdress = Arr.find(possibleColAddresses, (num) => Arr.forall(lockedColumns, (col) => col !== num)).getOr(gridColLength - 1);
  return {
    ...currentStartAddress,
    column: validColAdress
  };
};

const merge = (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: SugarElement, b: SugarElement) => boolean): Result<Structs.RowCells[], string> => {
  const lockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(gridA);
  const validStartAddress = getValidStartAddress(startAddress, gridA, lockedColumns);
  const lockedColumnsWithinBounds = Arr.filter(lockedColumns, (colNum) => colNum >= validStartAddress.column && colNum <= GridRow.cellLength(gridB[0]) + validStartAddress.column);

  const result = Fitment.measure(validStartAddress, gridA, gridB);
  // Need to subtract extra delta for locked columns between startAddress and the startAdress + gridB column count as
  // locked column cells cannot be merged into. Therefore, extra column cells need to be added to gridA to allow gridB cells to be merged
  return result.map((diff) => {
    const delta: Fitment.Delta = {
      ...diff,
      colDelta: diff.colDelta - lockedColumnsWithinBounds.length
    };

    const fittedGrid = Fitment.tailor(gridA, delta, generator);
    return mergeTables(validStartAddress, fittedGrid, gridB, generator, comparator, lockedColumnsWithinBounds);
  });
};

const insertCols = (index: number, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: SugarElement, b: SugarElement) => boolean): Structs.RowCells[] => {
  MergingOperations.splitCols(gridA, index, comparator, generator.cell);

  const delta = Fitment.measureHeight(gridB, gridA);
  const fittedNewGrid = Fitment.tailor(gridB, delta, generator);

  const secondDelta = Fitment.measureHeight(gridA, fittedNewGrid);
  const fittedOldGrid = Fitment.tailor(gridA, secondDelta, generator);

  return Arr.map(fittedOldGrid, (gridRow, i) => {
    const newCells = gridRow.cells.slice(0, index).concat(fittedNewGrid[i].cells).concat(gridRow.cells.slice(index, gridRow.cells.length));
    return GridRow.setCells(gridRow, newCells);
  });
};

const insertRows = (index: number, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: SugarElement, b: SugarElement) => boolean): Structs.RowCells[] => {
  MergingOperations.splitRows(gridA, index, comparator, generator.cell);

  const locked = LockedColumnUtils.getLockedColumnsFromGrid(gridA);
  const diff = Fitment.measureWidth(gridB, gridA);
  // Don't want the locked columns to count towards to the colDelta as column filling for locked columns is handled separately
  const delta: Fitment.Delta = {
    ...diff,
    colDelta: diff.colDelta + locked.length
  };
  const fittedGridB = Fitment.lockedColFill(gridB, generator, locked);
  const fittedNewGrid = Fitment.tailor(fittedGridB, delta, generator);

  // Don't need to worry about locked columns in this pass,
  // as gridB (pasted row) has already been adjusted to include cells for the locked columns and should match gridA column count
  const secondDelta = Fitment.measureWidth(gridA, fittedNewGrid);
  const fittedOldGrid = Fitment.tailor(gridA, secondDelta, generator);
  const { cols: oldCols, rows: oldRows } = GridRow.extractGridDetails(fittedOldGrid);

  return oldCols.concat(oldRows.slice(0, index)).concat(fittedNewGrid).concat(oldRows.slice(index, oldRows.length));
};

export {
  merge,
  insertCols,
  insertRows
};
