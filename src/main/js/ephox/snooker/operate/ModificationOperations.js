define(
  'ephox.snooker.operate.ModificationOperations',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Structs, GridRow, Util) {
    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var between = GridRow.mapCells(grid[example], function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCell(grid[index - 1], c), GridRow.getCell(grid[index], c));
        return withinSpan ? GridRow.getCell(grid[index], c) : substitution(ex, comparator);
      });

      return before.concat([ between ]).concat(after);
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowsAt = function (grid, index, rows, example, comparator, substitution) {
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var between = Util.repeat(rows, function () {
        return GridRow.mapCells(grid[example], function (ex, c) {
          var withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCell(grid[index - 1], c), GridRow.getCell(grid[index], c));
          return withinSpan ? GridRow.getCell(grid[index], c) : substitution(ex, comparator);
        });
      });

      return before.concat(between).concat(after);
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the column index)
    // index is the insert position (at - or after - example) (the column index)
    var insertColumnAt = function (grid, index, example, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < GridRow.cellLength(row) && comparator(GridRow.getCell(row, index - 1), GridRow.getCell(row, index));
        var sub = withinSpan ? GridRow.getCell(row, index) : substitution(GridRow.getCell(row, example), comparator);
        return GridRow.addCell(row, index, sub);
      });
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the column index)
    // index is the insert position (at - or after - example) (the column index)
    var insertColumnsAt = function (grid, index, columns, example, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < GridRow.cellLength(row) && comparator(GridRow.getCell(row, index - 1), GridRow.getCell(row, index));
        var sub = withinSpan ? function() { return GridRow.getCell(row, index); } : function () {
          return substitution(GridRow.getCell(row, example));
        };
        return GridRow.addCells(row, index, columns, sub);
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
        var sub = isTargetCell ? substitution(GridRow.getCell(row, exampleCol), comparator) : GridRow.getCell(row, exampleCol);
        return GridRow.addCell(row, index, sub);
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

      var between = GridRow.mapCells(grid[exampleRow], function (ex, i) {
        var isTargetCell = (i === exampleCol);
        return isTargetCell ? substitution(ex, comparator) : ex;
      });

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
      insertRowsAt: insertRowsAt,
      insertColumnAt: insertColumnAt,
      insertColumnsAt: insertColumnsAt,
      splitCellIntoColumns: splitCellIntoColumns,
      splitCellIntoRows: splitCellIntoRows,
      deleteRowsAt: deleteRowsAt,
      deleteColumnsAt: deleteColumnsAt
    };
  }
);