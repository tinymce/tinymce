define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'global!Math'
  ],

  function (Arr, Fun, Math) {
    var measure = function (startAddress, gridA, gridB) {
      if(startAddress.row() >= gridA.length || startAddress.column() >= gridA[0].length) throw 'invalid startAddress out of bounds, do we care about this?';
      var rowRemainder = gridA.slice(startAddress.row());
      var colRemainder = rowRemainder[0].slice(startAddress.column());

      var rowRequired = gridB[0].length;
      var colRequired = gridB.length;
      return {
        rowDelta: Fun.constant(rowRemainder.length - rowRequired),
        colDelta: Fun.constant(colRemainder.length - colRequired)
      };
    };

    var rowFill = function (grid, amount, generator) {
      var nuRow = Arr.map(grid[0], function (cell) {
        return generator.cell();
      });
      return grid.concat([nuRow]);
    };

    var colFill = function (grid, amount, generator) {
      return Arr.map(grid, function (row) {
        return row.concat([generator.cell()]);
      });
    };

    var abs = function (negInt) {
      var posInt = Math.abs(negInt);
      return posInt;
    };

    var tailor = function (startAddress, gridA, gridB, generator) {
      var ideal = measure(startAddress, gridA, gridB);

      var fillCols = ideal.colDelta() < 0 ? colFill : Fun.identity;
      var fillRows = ideal.rowDelta() < 0 ? rowFill : Fun.identity;

      var modifiedCols = fillCols(gridA, abs(ideal.colDelta()), generator);
      var tailoredGrid = fillRows(modifiedCols, abs(ideal.rowDelta()), generator);
      return tailoredGrid;
    };

    var skip = function (start, current, replacement, x) {
      //               let,
      //                  listA = a, b, c, d, e
      //                  listB =       1, 2
      // merge gridB into listA = a, b, 1, 2, e
      // this fn will skip over a, b and e
      // same concept applies for both rows & columns

      var end = start + replacement;

console.log('skip', start > current || end <= current);
console.log(start > current, end <= current);
console.log('args', start, current, replacement);
console.log('==========================');


      return start > current || end <= current;
    };

    var mergeGrid = function (startAddress, gridA, gridB, generator) {
      var fittedGrid = tailor(startAddress, gridA, gridB, generator);
      var mergedTable = Arr.map(fittedGrid, function (row, r) {
        var repRow = r - startAddress.row();
        var skipRow = skip(startAddress.row(), r, gridB[0].length);
        if (skipRow) return row;
        else return Arr.map(row, function (cell, c) {
          var repCol = c - startAddress.column();
          var skipCell = skip(startAddress.column(), c, gridB.length);

          if (skipCell) return cell;
          else return generator.replace(gridB[repRow][repCol]);
        });
      });
      return mergedTable;
    };

    return {
      measure: measure,
      tailor: tailor,
      patch: mergeGrid
    };
  }
);