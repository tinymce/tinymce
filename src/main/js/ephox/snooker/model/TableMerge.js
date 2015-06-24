define(
  'ephox.snooker.model.TableMerge',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Arr, Fun, Fitment, MergingOperations) {
    // an arbitary limit, to stop retrying incase we hit stack overflows.
    // Its expected that most retries will be under 3 and thats for really edgy cases.
    var RETRIES = 1000;

    var skip = function (start, current, replacement, x) {
      /*
        If the current Position is before or after the insertion point skip over it.
                      let,
                         listA = a, b, c, d, e
                         listB =       1, 2
        merge gridB into listA = a, b, 1, 2, e
        this fn will skip over a, b and e, same concept applies for both rows & columns
      */
      var end = start + replacement;
      return start > current || end <= current;
    };

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
      // return Arr.map(gridA, function (row, r) {
      //   var repRow = r - startRow;
      //   var skipRow = skip(startRow, r, mergeHeight);
      //   if (skipRow) return row;

      //   else return Arr.map(row, function (cell, c) {
      //     var repCol = c - startCol;
      //     var skipCell = skip(startCol, c, mergeWidth);
      //     if (skipCell) return cell;
      //     else {
      //       if (isSpanning(gridA, r, c, comparator)) {
      //         MergingOperations.unmerge(gridA, cell, comparator, generator.cell);
      //       }
      //       return generator.replace(gridB[repRow][repCol]);
      //     }
      //   });
      // });
    };

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
var start = new Date().getTime();

      var delta = Fitment.measure(startAddress, gridA, gridB);
      var fittedGrid = Fitment.tailor(startAddress, gridA, delta, generator);
      var xx = mergeTables(startAddress, fittedGrid, gridB, generator, comparator);

var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
      return xx; // inline, only here for logging (aka showing off)

    };

    return {
      merge: merge
    };
  }
);