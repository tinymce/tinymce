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
     * row is the row index into the grid
     * column in the column index into the grid
     * grid is the grid
     *
     * Return
     *   colspan: column span of the cell at (row, column)
     *   rowspan: row span of the cell at (row, column)
     */
    var capisco = function (row, column, grid, comparator) {
      var restOfRow = getRow(grid, row).slice(column);
      var endColIndex = findDiff(restOfRow, comparator);

      var restOfColumn = getColumn(grid, column).slice(row);
      var endRowIndex = findDiff(restOfColumn, comparator);

      return {
        colspan: endColIndex,
        rowspan: endRowIndex
      };
    };

    return {
      capisco: capisco
    };
  }
);