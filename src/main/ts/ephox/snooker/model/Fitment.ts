import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import Structs from '../api/Structs';
import GridRow from './GridRow';
import Util from '../util/Util';

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

var measure = function (startAddress, gridA: Row[], gridB): Result<Delta, string> {
  if (startAddress.row() >= gridA.length || startAddress.column() > GridRow.cellLength(gridA[0])) return Result.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
  var rowRemainder = gridA.slice(startAddress.row());
  var colRemainder = rowRemainder[0].cells().slice(startAddress.column());

  var colRequired = GridRow.cellLength(gridB[0]);
  var rowRequired = gridB.length;
  return Result.value({
    rowDelta: Fun.constant(rowRemainder.length - rowRequired),
    colDelta: Fun.constant(colRemainder.length - colRequired)
  });
};

var measureWidth = function (gridA: Row[], gridB: Row[]) {
  var colLengthA = GridRow.cellLength(gridA[0]);
  var colLengthB = GridRow.cellLength(gridB[0]);

  return {
    rowDelta: Fun.constant(0),
    colDelta: Fun.constant(colLengthA - colLengthB)
  };
};

var fill = function (cells, generator) {
  return Arr.map(cells, function () {
    return Structs.elementnew(generator.cell(), true);
  });
};

var rowFill = function (grid: Row[], amount: number, generator) {
  return grid.concat(Util.repeat(amount, function (_row) {
    return GridRow.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
  }));
};

var colFill = function (grid: Row[], amount: number, generator) {
  return Arr.map(grid, function (row) {
    return GridRow.setCells(row, row.cells().concat(fill(Util.range(0, amount), generator)));
  });
};

export interface Delta {
  colDelta: () => number;
  rowDelta: () => number;
}
export interface Row {
  cells: () => any
}

var tailor = function (gridA: Row[], delta: Delta, generator) {
  var fillCols = delta.colDelta() < 0 ? colFill : Fun.identity;
  var fillRows = delta.rowDelta() < 0 ? rowFill : Fun.identity;

  var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
  var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
  return tailoredGrid;
};

export default {
  measure: measure,
  measureWidth: measureWidth,
  tailor: tailor
};