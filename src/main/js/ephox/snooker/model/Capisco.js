define(
  'ephox.snooker.model.Capisco',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    var getColumn = function (grid, index) {
      return Arr.map(grid, function (row) {
        return row[index];
      });
    };

    var getRow = function (grid, index) {
      return grid[index];
    };


    var findDiff = function (xs, comp) {
      if (xs.length === 0) return 0;
      var first = xs[0];
      var index = Arr.findIndex(xs, function (x) {
        return !comp(first, x);
      });
      return index === -1 ? xs.length : index;
    };

    /*
     * Row is the row index into the grid
     * Column in the column index into the grid
     * Grid is the grid
     * Seen is a grid of booleans telling you what you have already seen
     *
     * Return
     *   colspan: column span of the cell at (row, column)
     *   rowspan: row span of the cell at (row, column)
     *   seen: a new grid with additional booleans saying which things have already been seen
     */
    var capisco = function (row, column, grid, seen) {
      var restOfRow = getRow(grid, row).slice(column);
      var endColIndex = findDiff(restOfRow, Fun.tripleEquals);
      console.log('ending index', endColIndex);

      var restOfColumn = getColumn(grid, column).slice(row);
      var endRowIndex = findDiff(restOfColumn, Fun.tripleEquals);
      console.log('restOfColumn', restOfColumn, 'endRowIndex:', endRowIndex);

      return {
        colspan: endColIndex,
        rowspan: endRowIndex,
        seen: seen
      };
    };

    return {
      capisco: capisco
    };
  }
);