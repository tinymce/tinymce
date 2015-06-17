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
      return Arr.map(grid, function (rows) {
        return rows.concat([generator.cell()]);
      });
    };

    var abs = function (negInt) {
      var posInt = Math.abs(negInt);
      return posInt;
    };

    var tailor = function (startAddress, gridA, gridB, generator) {
      var ideal = measure(startAddress, gridA, gridB);

      var patchCols = ideal.colDelta() < 0 ? colFill : Fun.identity;
      var patchRows = ideal.rowDelta() < 0 ? rowFill : Fun.identity;

      var modifiedCols = patchCols(gridA, abs(ideal.colDelta()), generator);
      var tailoredGrid = patchRows(modifiedCols, abs(ideal.rowDelta()), generator);
      return tailoredGrid;
    };

    return {
      measure: measure,
      tailor: tailor
    };
  }
);