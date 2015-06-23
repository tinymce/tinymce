define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.operate.MergingOperations',
    'ephox.snooker.util.CellUtils',
    'global!Array',
    'global!Math'
  ],

  function (Arr, Fun, MergingOperations, CellUtils, Array, Math) {
    // an arbitary limit, to stop retrying incase we hit stack overflows.
    // Its expected that most retries will be under 3 and thats for really edgy cases.
    var RETRIES = 1000;

    var measure = function (startAddress, gridA, gridB) {
      if(startAddress.row() >= gridA.length || startAddress.column() > gridA[0].length) throw 'invalid startAddress out of table bounds';
      var rowRemainder = gridA.slice(startAddress.row());
      var colRemainder = rowRemainder[0].slice(startAddress.column());

      var colRequired= gridB[0].length;
      var rowRequired= gridB.length;
      return {
        rowDelta: Fun.constant(rowRemainder.length - rowRequired),
        colDelta: Fun.constant(colRemainder.length - colRequired)
      };
    };

    var rowFill = function (grid, amount, generator) {
      var nuRows = Arr.map(new Array(amount), function (row) {
        return Arr.map(grid[0], function (cell) {
          return generator.cell();
        });
      });
      return grid.concat(nuRows);
    };

    var colFill = function (grid, amount, generator) {
      return Arr.map(grid, function (row) {
        var fill = Arr.map(new Array(amount), function () {
          return generator.cell();
        });
        return row.concat(fill);
      });
    };

    var abs = function (negInt) {
      var posInt = Math.abs(negInt);
      return posInt;
    };

    var tailor = function (startAddress, gridA, delta, generator) {
      var fillCols = delta.colDelta() < 0 ? colFill : Fun.identity;
      var fillRows = delta.rowDelta() < 0 ? rowFill : Fun.identity;

      var modifiedCols = fillCols(gridA, abs(delta.colDelta()), generator);
      var tailoredGrid = fillRows(modifiedCols, abs(delta.rowDelta()), generator);
      return tailoredGrid;
    };

    var skip = function (start, current, replacement, x) {
      // If the current Position is before or after the insertion point skip over it.
      //               let,
      //                  listA = a, b, c, d, e
      //                  listB =       1, 2
      // merge gridB into listA = a, b, 1, 2, e
      // this fn will skip over a, b and e
      // same concept applies for both rows & columns
      var end = start + replacement;
      return start > current || end <= current;
    };

    var detectSpan = function (startAddress, gridA, gridB, comparator) {
      // TODO: ATOMIC TEST THIS
      var knownSpans = CellUtils.cellSpan(gridA, comparator);
      var target = false;

      var rowsA = gridA.length;
      var rowsB = gridB.length;

      for (var r = 0, row, repRow, skipRow; r < rowsA && target === false; r++) {
        row = gridA[r];
        repRow = r - startAddress.row();
        skipRow = skip(startAddress.row(), r, rowsB);

        if (!skipRow) {
          for (var c = 0, cell, repCol, skipCell; c < gridA[r].length && target === false; c++) {
            cell = gridA[r][c];
            repCol = c - startAddress.column();
            skipCell = skip(startAddress.column(), c, gridB[0].length);
            var candidate = gridA[repRow][repCol];

            if (!skipCell && Arr.exists(knownSpans, Fun.curry(comparator, candidate))) {
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
          unmergedGrid = MergingOperations.unmerge(gridA, intersectsSpan, comparator, generator.cell);
        }

        intersectsSpan = detectSpan (startAddress, unmergedGrid, gridB, comparator);

console.log(intersectsSpan);

        attempts++;
      } while (attempts < RETRIES && intersectsSpan !== false);

      return unmergedGrid;
    };

    var mergedTable = function (startAddress, gridA, gridB, generator) {
      // Assumes
      //  - gridA is square and gridB is square
      //  - gridB does not interesect gridA on a span
      return Arr.map(gridA, function (row, r) {
        var repRow = r - startAddress.row();
        var skipRow = skip(startAddress.row(), r, gridB.length);
        if (skipRow) return row;

        else return Arr.map(row, function (cell, c) {
          var repCol = c - startAddress.column();
          var skipCell = skip(startAddress.column(), c, gridB[0].length);

          if (skipCell) return cell;
          else return generator.replace(gridB[repRow][repCol]);
        });
      });
    };

    var mergeGrid = function (startAddress, gridA, gridB, generator, comparator) {
      var delta = measure(startAddress, gridA, gridB);
      var fittedGrid = tailor(startAddress, gridA, delta, generator);
      var squaredGrid = unmergeIntersections(startAddress, fittedGrid, gridB, generator, comparator);
      return mergedTable(startAddress, squaredGrid, gridB, generator);
    };

    return {
      measure: measure,
      tailor: tailor,
      mergeGrid: mergeGrid
    };
  }
);