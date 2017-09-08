define(
  'ephox.snooker.model.TableMerge',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Fun, Structs, Fitment, GridRow, MergingOperations) {
    var isSpanning = function (grid, row, col, comparator) {
      var candidate = GridRow.getCell(grid[row], col);
      var matching = Fun.curry(comparator, candidate.element());
      var currentRow = grid[row];

      // sanity check, 1x1 has no spans
      return grid.length > 1 && GridRow.cellLength(currentRow) > 1 &&
      (
        // search left, if we're not on the left edge
        (col > 0 && matching(GridRow.getCell(currentRow, col-1).element())) ||
        // search right, if we're not on the right edge
        (col < currentRow.length - 1 && matching(GridRow.getCell(currentRow, col+1).element())) ||
        // search up, if we're not on the top edge
        (row > 0 && matching(GridRow.getCell(grid[row-1], col).element())) ||
        // search down, if we're not on the bottom edge
        (row < grid.length - 1 && matching(GridRow.getCell(grid[row+1], col).element()))
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
      // embrace the mutation - I think this is easier to follow? To discuss.
      for (var r = startRow; r < endRow; r++) {
        for (var c = startCol; c < endCol; c++) {
          if (isSpanning(gridA, r, c, comparator)) {
            // mutation within mutation, it's mutatception
            MergingOperations.unmerge(gridA, GridRow.getCell(gridA[r], c).element(), comparator, generator.cell);
          }
          var newCell = GridRow.getCell(gridB[r - startRow], c - startCol).element();
          var replacement = generator.replace(newCell);
          GridRow.mutateCell(gridA[r], c, Structs.elementnew(replacement, true));
        }
      }
      return gridA;
    };

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
      var result = Fitment.measure(startAddress, gridA, gridB);
      return result.map(function (delta) {
        var fittedGrid = Fitment.tailor(gridA, delta, generator);
        return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
      });
    };

    var insert = function (index, gridA, gridB, generator, comparator) {
      MergingOperations.splitRows(gridA, index, comparator, generator.cell);

      var delta = Fitment.measureWidth(gridB, gridA);
      var fittedNewGrid = Fitment.tailor(gridB, delta, generator);

      var secondDelta = Fitment.measureWidth(gridA, fittedNewGrid);
      var fittedOldGrid = Fitment.tailor(gridA, secondDelta, generator);

      return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
    };

    return {
      merge: merge,
      insert: insert
    };
  }
);