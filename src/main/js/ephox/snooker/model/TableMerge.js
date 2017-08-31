define(
  'ephox.snooker.model.TableMerge',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Arr, Fun, Structs, Fitment, GridRow, MergingOperations) {
    var isSpanning = function (grid, row, col, comparator) {
      var candidate = GridRow.getCell(grid[row], col);
      var matching = Fun.curry(comparator, candidate);
      var currentRow = grid[row];

      // sanity check, 1x1 has no spans
      return grid.length > 1 && GridRow.cellLength(currentRow) > 1 &&
      (
        // search left, if we're not on the left edge
        (col > 0 && matching(GridRow.getCell(currentRow, col-1))) ||
        // search right, if we're not on the right edge
        (col < currentRow.length - 1 && matching(GridRow.getCell(currentRow, col+1))) ||
        // search up, if we're not on the top edge
        (row > 0 && matching(GridRow.getCell(grid[row-1], col))) ||
        // search down, if we're not on the bottom edge
        (row < grid.length - 1 && matching(GridRow.getCell(grid[row+1], col)))
      );
    };

    var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
      // Assumes
      //  - gridA is square and gridB is square
      var startRow = startAddress.row();
      var startCol = startAddress.column();
      var mergeHeight = gridB.length;
      var mergeWidth = GridRow.cellLength(gridB[0]);
      var endRow = startRow + mergeHeight;
      var endCol = startCol + mergeWidth;
      var elementNewGrid = Arr.map(gridA, function (row) {
        return GridRow.mapCells(row, function (cell) {
          return Structs.elementnew(cell, false);
        });
      });
      // embrace the mutation - I think this is easier to follow? To discuss.
      for (var r = startRow; r < endRow; r++) {
        for (var c = startCol; c < endCol; c++) {
          if (isSpanning(gridA, r, c, comparator)) {
            // mutation within mutation, it's mutatception
            MergingOperations.unmergeInner(elementNewGrid, GridRow.getCell(elementNewGrid[r], c).element(), comparator, generator.cell);
          }
        }
      }
      return elementNewGrid;
    };

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
      var result = Fitment.measure(startAddress, gridA, gridB);
      return result.map(function (delta) {
        var fittedGrid = Fitment.tailor(startAddress, gridA, delta, generator);
        return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
      });
    };

    return {
      merge: merge
    };
  }
);