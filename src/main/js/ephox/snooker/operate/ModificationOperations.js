define(
  'ephox.snooker.operate.ModificationOperations',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs'
  ],

  function (Arr, Structs) {
    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var betweenCells = Arr.map(grid[example].cells(), function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(grid[index - 1].cells()[c], grid[index].cells()[c]);
        return withinSpan ? grid[index].cells()[c] : substitution(ex, comparator);
      });

      var between = Structs.rowcells(betweenCells, grid[example].section());

      return before.concat([ between ]).concat(after);
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the column index)
    // index is the insert position (at - or after - example) (the column index)
    var insertColumnAt = function (grid, index, example, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < row.length && comparator(row.cells()[index - 1], row.cells()[index]);
        var sub = withinSpan ? row.cells()[index] : substitution(row.cells()[example], comparator);
        var cells = row.cells().slice(0, index).concat([ sub ]).concat(row.cells().slice(index));
        return Structs.rowcells(cells, row.section());
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
        var sub = isTargetCell ? substitution(row.cells()[exampleCol], comparator) : row.cells()[exampleCol];
        var cells = row.cells().slice(0, index).concat([ sub ]).concat(row.cells().slice(index));
        return Structs.rowcells(cells, row.section());
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

      var betweenCells = Arr.map(grid[exampleRow].cells() || [], function (ex, i) {
        var isTargetCell = (i === exampleCol);
        return isTargetCell ? substitution(ex, comparator) : ex;
      });

      var between = Structs.rowcells(betweenCells, grid[exampleRow].section());

      return before.concat([ between ]).concat(after);
    };

    var deleteColumnsAt = function (grid, start, finish) {
      return Arr.map(grid, function (row) {
        var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
        return Structs.rowcells(cells, row.section());
      });
    };

    var deleteRowsAt = function (grid, start, finish) {
      return grid.slice(0, start).concat(grid.slice(finish + 1));
    };

    return {
      insertRowAt: insertRowAt,
      insertColumnAt: insertColumnAt,
      splitCellIntoColumns: splitCellIntoColumns,
      splitCellIntoRows: splitCellIntoRows,
      deleteRowsAt: deleteRowsAt,
      deleteColumnsAt: deleteColumnsAt
    };
  }
);