define(
  'ephox.snooker.model.TableMerge',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Fun, Fitment, MergingOperations) {
    var isSpanning = function (grid, row, col, comparator) {
      var candidate = grid[row][col];
      var matching = Fun.curry(comparator, candidate);
      var rowArray = grid[row];

      // sanity check, 1x1 has no spans
      return grid.length > 1 && rowArray.length > 1 &&
      (
        // search left, if we're not on the left edge
        (col > 0 && matching(rowArray[col-1])) ||
        // search right, if we're not on the right edge
        (col < rowArray.length - 1 && matching(rowArray[col+1])) ||
        // search up, if we're not on the top edge
        (row > 0 && matching(grid[row-1][col])) ||
        // search down, if we're not on the bottom edge
        (row < grid.length - 1 && matching(grid[row+1][col]))
      );
    };

    var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
      // Assumes
      //  - gridA is square and gridB is square
      var startRow = startAddress.row();
      var startCol = startAddress.column();
      var mergeHeight = gridB.length;
      var mergeWidth = gridB[0].length;
      var endRow = startRow + mergeHeight;
      var endCol = startCol + mergeWidth;

      // embrace the mutation - I think this is easier to follow? To discuss.
      for (var r = startRow; r < endRow; r++) {
        for (var c = startCol; c < endCol; c++) {
          if (isSpanning(gridA, r, c, comparator)) {
            // mutation within mutation, it's mutatception
            MergingOperations.unmerge(gridA, gridA[r][c], comparator, generator.cell);
          }
          gridA[r][c] = generator.replace(gridB[r - startRow][c - startCol]);
        }
      }
      return gridA;
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