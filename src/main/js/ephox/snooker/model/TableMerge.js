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
            MergingOperations.unmergeInner(gridA, GridRow.getCell(gridA[r], c).element(), comparator, generator.cell);
          }
        }
      }
      return elementNewGrid;
    };

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
      var result = Fitment.measure(startAddress, gridA, gridB);
      return result.map(function (delta) {
        var elementNewGrid = Arr.map(gridA, function (row) {
          return GridRow.mapCells(row, function (cell) {
            return Structs.elementnew(cell, false);
          });
        });
        var fittedGrid = Fitment.tailor(startAddress, elementNewGrid, delta, generator);
        return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
      });
    };

    var insert = function (index, gridA, gridB, generators, comparator) {
      var elementOldGrid = Arr.map(gridA, function (row) {
        return GridRow.mapCells(row, function (cell) {
          return Structs.elementnew(cell, false);
        });
      });
      var elementNewGrid = Arr.map(gridB, function (row) {
        return GridRow.mapCells(row, function (cell) {
          return Structs.elementnew(cell, true);
        });
      });
      return elementOldGrid.slice(0, index).concat(elementNewGrid).concat(elementOldGrid.slice(index, gridA.length));
    };

    return {
      merge: merge,
      insert: insert
    };
  }
);