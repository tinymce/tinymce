import { Fun } from '@ephox/katamari';
import * as Structs from '../api/Structs';
import Fitment from './Fitment';
import GridRow from './GridRow';
import MergingOperations from '../operate/MergingOperations';
import { SimpleGenerators } from '../api/Generators';
import { Element } from '@ephox/sugar';

const isSpanning = function (grid: Structs.RowCells[], row: number, col: number, comparator: (a: Element, b: Element) => boolean) {
  const candidate = GridRow.getCell(grid[row], col);
  const matching = Fun.curry(comparator, candidate.element());
  const currentRow = grid[row];

  // sanity check, 1x1 has no spans
  return grid.length > 1 && GridRow.cellLength(currentRow) > 1 &&
    (
      // search left, if we're not on the left edge
      // search down, if we're not on the bottom edge
      (col > 0 && matching(GridRow.getCellElement(currentRow, col - 1))) ||
      // search right, if we're not on the right edge
      (col < currentRow.cells().length - 1 && matching(GridRow.getCellElement(currentRow, col + 1))) ||
      // search up, if we're not on the top edge
      (row > 0 && matching(GridRow.getCellElement(grid[row - 1], col))) ||
      (row < grid.length - 1 && matching(GridRow.getCellElement(grid[row + 1], col)))
    );
};

const mergeTables = function (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: Element, b: Element) => boolean) {
  // Assumes
  //  - gridA is square and gridB is square
  const startRow = startAddress.row();
  const startCol = startAddress.column();
  const mergeHeight = gridB.length;
  const mergeWidth = GridRow.cellLength(gridB[0]);
  const endRow = startRow + mergeHeight;
  const endCol = startCol + mergeWidth;
  // embrace the mutation - I think this is easier to follow? To discuss.
  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      if (isSpanning(gridA, r, c, comparator)) {
        // mutation within mutation, it's mutatception
        MergingOperations.unmerge(gridA, GridRow.getCellElement(gridA[r], c), comparator, generator.cell);
      }
      const newCell = GridRow.getCellElement(gridB[r - startRow], c - startCol);
      const replacement = generator.replace(newCell);
      GridRow.mutateCell(gridA[r], c, Structs.elementnew(replacement, true));
    }
  }
  return gridA;
};

const merge = function (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: Element, b: Element) => boolean) {
  const result = Fitment.measure(startAddress, gridA, gridB);
  return result.map(function (delta) {
    const fittedGrid = Fitment.tailor(gridA, delta, generator);
    return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
  });
};

const insert = function (index: number, gridA: Structs.RowCells[], gridB: Structs.RowCells[], generator: SimpleGenerators, comparator: (a: Element, b: Element) => boolean): Structs.RowCells[] {
  MergingOperations.splitRows(gridA, index, comparator, generator.cell);

  const delta = Fitment.measureWidth(gridB, gridA);
  const fittedNewGrid = Fitment.tailor(gridB, delta, generator);

  const secondDelta = Fitment.measureWidth(gridA, fittedNewGrid);
  const fittedOldGrid = Fitment.tailor(gridA, secondDelta, generator);

  return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
};

export default {
  merge,
  insert
};