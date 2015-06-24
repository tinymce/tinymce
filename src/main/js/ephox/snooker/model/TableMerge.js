define(
  'ephox.snooker.model.TableMerge',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.operate.MergingOperations',
    'ephox.snooker.util.CellUtils'
  ],

  function (Arr, Fun, Fitment, MergingOperations, CellUtils) {
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

    var isSpanning = function (grid, row, col, candidate, comparator) {
      var matching = Fun.curry(comparator, candidate);
      // var matching = function (x) {
      //   var xx = comparator(x, candidate);
      //   console.log('comparing', x, xx);
      //   return xx;
      // };
      var rowArray = grid[row];

      // sanity check
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

    var detectSpan = function (startAddress, gridA, gridB, comparator) {
      var target = false;

      var rowsA = gridA.length;
      var rowsB = gridB.length;

      for (var r = 0, skipRow; r < rowsA && target === false; r++) {
        skipRow = skip(startAddress.row(), r, rowsB);
        if (!skipRow) {
          for (var c = 0, skipCell; c < gridA[r].length && target === false; c++) {
            skipCell = skip(startAddress.column(), c, gridB[0].length);
            var candidate = gridA[r][c];
            if (!skipCell && isSpanning(gridA, r, c, candidate, comparator)) {
              target = candidate;
            }
          }
        }
      }
      return target;
    };

    var unmergeIntersections = function (startAddress, gridA, gridB, generator, comparator) {
      var unmergedGrid = gridA;
      var attempts = 0;
      var intersectsSpan = false;

      do {
        if (intersectsSpan !== false) {
          // console.log('unmerge old before');
          // console.log(unmergedGrid, intersectsSpan);
          unmergedGrid = MergingOperations.unmerge(unmergedGrid, intersectsSpan, comparator, generator.cell);
          // console.log('unmerge old after');
          // console.log(unmergedGrid, intersectsSpan);
        }
        intersectsSpan = detectSpan(startAddress, unmergedGrid, gridB, comparator);
        attempts++;
      } while (attempts < RETRIES && intersectsSpan !== false);
      return unmergedGrid;
    };

    var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
      // Assumes
      //  - gridA is square and gridB is square
      //  - inserting gridB does not interesect any cell spans on gridA
      var startRow = startAddress.row();
      var startCol = startAddress.column();
      var gridHeight = gridB.length;
      var gridWidth = gridB[0].length;

      return Arr.map(gridA, function (row, r) {
        var repRow = r - startRow;
        var skipRow = skip(startRow, r, gridHeight);
        if (skipRow) return row;

        else return Arr.map(row, function (cell, c) {
          var repCol = c - startCol;
          var skipCell = skip(startCol, c, gridWidth);

          if (skipCell) return cell;
          else {
            if (isSpanning(gridA, r, c, cell, comparator)) {
              // console.log('unmerge new before');
              // console.log(gridA, cell);
              MergingOperations.unmerge(gridA, cell, comparator, generator.cell);
              // console.log('unmerge new after');
              // console.log(gridA, cell);
            }
            return generator.replace(gridB[repRow][repCol]);
          }
        });
      });
    };

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
var start = new Date().getTime();

      var delta = Fitment.measure(startAddress, gridA, gridB);
      var fittedGrid = Fitment.tailor(startAddress, gridA, delta, generator);
      // var cleanGrid = unmergeIntersections(startAddress, fittedGrid, gridB, generator, comparator);
      var xx = mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
      return xx; // inline, only here for logging

    };

    return {
      merge: merge,
      detectSpan: detectSpan,
      unmergeIntersections: unmergeIntersections
    };
  }
);