define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'global!Math',
    'global!Array'
  ],

  function (Arr, Fun, Math, Array) {
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

    var mergeGrid = function (startAddress, gridA, gridB, generator) {
      var delta = measure(startAddress, gridA, gridB);
      var fittedGrid = tailor(startAddress, gridA, delta, generator);

      var mergedTable = Arr.map(fittedGrid, function (row, r) {
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
      return mergedTable;
    };

    return {
      measure: measure,
      tailor: tailor,
      mergeGrid: mergeGrid
    };
  }
);