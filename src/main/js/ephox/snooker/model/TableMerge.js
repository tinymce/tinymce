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

    var detectSpan = function (startAddress, gridA, gridB, comparator) {
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
            var candidate = gridA[r][c];
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
          unmergedGrid = MergingOperations.unmerge(unmergedGrid, intersectsSpan, comparator, generator.cell);
        }
        intersectsSpan = detectSpan(startAddress, unmergedGrid, gridB, comparator);
        attempts++;
      } while (attempts < RETRIES && intersectsSpan !== false);

      return unmergedGrid;
    };

    var mergeTables = function (startAddress, gridA, gridB, generator) {
      // Assumes
      //  - gridA is square and gridB is square
      //  - inserting gridB does not interesect any cell spans on gridA
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

    var merge = function (startAddress, gridA, gridB, generator, comparator) {
      var delta = Fitment.measure(startAddress, gridA, gridB);
      var fittedGrid = Fitment.tailor(startAddress, gridA, delta, generator);
      var cleanGrid = unmergeIntersections(startAddress, fittedGrid, gridB, generator, comparator);
      return mergeTables(startAddress, cleanGrid, gridB, generator);
    };

    return {
      merge: merge,
      detectSpan: detectSpan,
      unmergeIntersections: unmergeIntersections
    };
  }
);