define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.snooker.util.Util',
    'global!Array',
    'global!Error',
    'global!Math'
  ],

  function (Arr, Fun, Result, Util, Array, Error, Math) {
    /*
      Fitment, is a module used to ensure that the Inserted table (gridB) can fit squareley within the Host table (gridA).
        - measure returns a delta of rows and cols, eg:
            - col: 3 means gridB can fit with 3 spaces to spare
            - row: -5 means gridB can needs 5 more rows to completely fit into gridA
            - col: 0, row: 0 depics perfect fitment

        - tailor, requires a delta and returns grid that is built to match the delta, tailored to fit.
          eg: 3x3 gridA, with a delta col: -3, row: 2 returns a new grid 3 rows x 6 cols

        - assumptions: All grids used by this module should be rectangular
    */

    var measure = function (startAddress, gridA, gridB) {
      if (startAddress.row() >= gridA.length || startAddress.column() > gridA[0].length) return Result.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
      var rowRemainder = gridA.slice(startAddress.row());
      var colRemainder = rowRemainder[0].slice(startAddress.column());

      var colRequired = gridB[0].length;
      var rowRequired = gridB.length;
      return Result.value({
        rowDelta: Fun.constant(rowRemainder.length - rowRequired),
        colDelta: Fun.constant(colRemainder.length - colRequired)
      });
    };

    var fill = function (cells, generator) {
      return Arr.map(cells, generator.cell);
    };

    var rowFill = function (grid, amount, generator) {
      return grid.concat(Util.repeat(amount, function (_row) {
        return fill(grid[0], generator);
      }));
    };

    var colFill = function (grid, amount, generator) {
      return Arr.map(grid, function (row) {
        return row.concat(fill(Util.range(0, amount), generator));
      });
    };

    var tailor = function (startAddress, gridA, delta, generator) {
      var fillCols = delta.colDelta() < 0 ? colFill : Fun.identity;
      var fillRows = delta.rowDelta() < 0 ? rowFill : Fun.identity;

      var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
      var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
      return tailoredGrid;
    };

    return {
      measure: measure,
      tailor: tailor
    };
  }
);