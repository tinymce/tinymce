define(
  'ephox.snooker.operate.ModificationOperations',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var between = Arr.map(grid[example], function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(grid[index - 1][c], grid[index][c]);
        return withinSpan ? grid[index][c] : substitution(ex, comparator);
      });

      return before.concat([ between ]).concat(after);
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the column index)
    // index is the insert position (at - or after - example) (the column index)
    var insertColumnAt = function (grid, index, example, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < row.length && comparator(row[index - 1], row[index]);
        var sub = withinSpan ? row[index] : substitution(row[example], comparator);
        return row.slice(0, index).concat([ sub ]).concat(row.slice(index));
      });
    };

    // substitution :: (item, comparator) -> item
    // Returns:
    // - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
    //   new cell follows, and is empty), and
    // - the other cells in that column set to span the split cell.
    var splitCellIntoColumns = function (grid, exampleRow, exampleCol, comparator, substitution) {
      var index = exampleCol + 1; // insert after
      return Arr.map(grid, function (row, i) {
        var isTargetCell = (i === exampleRow);
        var sub = isTargetCell ? substitution(row[exampleCol], comparator) : row[exampleCol];
        return row.slice(0, index).concat([ sub ]).concat(row.slice(index));
      });
    };

    // substitution :: (item, comparator) -> item
    // Returns:
    // - a new grid with the cell at coords [exampleRow, exampleCol] split into two cells (the
    //   new cell below, and is empty), and
    // - the other cells in that row set to span the split cell.
    var splitCellIntoRows = function (grid, exampleRow, exampleCol, comparator, substitution) {
      var index = exampleRow + 1; // insert after
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var between = Arr.map(grid[exampleRow] || [], function (ex, i) {
        var isTargetCell = (i === exampleCol);
        return isTargetCell ? substitution(ex, comparator) : ex;
      });

      return before.concat([ between ]).concat(after);
    };

    var deleteColumnAt = function (grid, index) {
      return Arr.map(grid, function (row) {
        return row.slice(0, index).concat(row.slice(index + 1));
      });
    };

    var deleteColumnsAt = function (grid, start, finish) {
      return Arr.map(grid, function (row) {
        return row.slice(0, start).concat(row.slice(finish + 1));
      });
    };

    var deleteRowAt = function (grid, index) {
      return grid.slice(0, index).concat(grid.slice(index + 1));
    };

    var deleteRowsAt = function (grid, start, finish) {
      return grid.slice(0, start).concat(grid.slice(finish + 1));
    };

    return {
      insertRowAt: insertRowAt,
      insertColumnAt: insertColumnAt,
      splitCellIntoColumns: splitCellIntoColumns,
      splitCellIntoRows: splitCellIntoRows,
      deleteRowAt: deleteRowAt,
      deleteRowsAt: deleteRowsAt,
      deleteColumnAt: deleteColumnAt,
      deleteColumnsAt: deleteColumnsAt
    };
  }
);