import { Arr, Fun, Result } from '@ephox/katamari';
import * as Structs from '../api/Structs';
import * as Util from '../util/Util';
import GridRow from './GridRow';
import { SimpleGenerators } from '../api/Generators';

export interface Delta {
  colDelta: () => number;
  rowDelta: () => number;
}

/*
  Fitment, is a module used to ensure that the Inserted table (gridB) can fit squareley within the Host table (gridA).
    - measure returns a delta of rows and cols, eg:
        - col: 3 means gridB can fit with 3 spaces to spare
        - row: -5 means gridB can needs 5 more rows to completely fit into gridA
        - col: 0, row: 0 depics perfect fitment

    - tailor, requires a delta and returns grid that is built to match the delta, tailored to fit.
      eg: 3x3 gridA, with a delta col: -3, row: 2 returns a new grid 3 rows x 6 cols

    - assumptions: All grids used by this module should be rectangular
*/

const measure = function (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[]): Result<Delta, string> {
  if (startAddress.row() >= gridA.length || startAddress.column() > GridRow.cellLength(gridA[0])) {
    return Result.error(
      'invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column()
    );
  }
  const rowRemainder = gridA.slice(startAddress.row());
  const colRemainder = rowRemainder[0].cells().slice(startAddress.column());

  const colRequired = GridRow.cellLength(gridB[0]);
  const rowRequired = gridB.length;
  return Result.value({
    rowDelta: Fun.constant(rowRemainder.length - rowRequired),
    colDelta: Fun.constant(colRemainder.length - colRequired)
  });
};

const measureWidth = function (gridA: Structs.RowCells[], gridB: Structs.RowCells[]): Delta {
  const colLengthA = GridRow.cellLength(gridA[0]);
  const colLengthB = GridRow.cellLength(gridB[0]);

  return {
    rowDelta: Fun.constant(0),
    colDelta: Fun.constant(colLengthA - colLengthB)
  };
};

const fill = function <T> (cells: T[], generator: SimpleGenerators) {
  return Arr.map(cells, function () {
    return Structs.elementnew(generator.cell(), true);
  });
};

const rowFill = function (grid: Structs.RowCells[], amount: number, generator: SimpleGenerators): Structs.RowCells[] {
  return grid.concat(Util.repeat(amount, function (_row) {
    return GridRow.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
  }));
};

const colFill = function (grid: Structs.RowCells[], amount: number, generator: SimpleGenerators): Structs.RowCells[] {
  return Arr.map(grid, function (row) {
    return GridRow.setCells(row, row.cells().concat(fill(Util.range(0, amount), generator)));
  });
};

const tailor = function (gridA: Structs.RowCells[], delta: Delta, generator: SimpleGenerators): Structs.RowCells[] {
  const fillCols = delta.colDelta() < 0 ? colFill : Fun.identity;
  const fillRows = delta.rowDelta() < 0 ? rowFill : Fun.identity;

  const modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
  const tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
  return tailoredGrid;
};

export default {
  measure,
  measureWidth,
  tailor
};