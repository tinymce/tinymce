define(
  'ephox.snooker.operate.ModificationOperations',

  [
    'ephox.compass.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.GridRow',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Structs, GridRow, Util) {
    var nonNewCells = function (row) {
      return GridRow.mapCells(row, function(cell, i) {
        return Structs.elementnew(GridRow.getCell(row, i), false);
      });
    };
    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = Arr.map(grid.slice(0, index), nonNewCells);
      var after = Arr.map(grid.slice(index), nonNewCells);

      var between = GridRow.mapCells(grid[example], function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCell(grid[index - 1], c), GridRow.getCell(grid[index], c));
        return withinSpan ? Structs.elementnew(GridRow.getCell(grid[index], c), false) : Structs.elementnew(substitution(ex, comparator), true);
      });

      return before.concat([ between ]).concat(after);
    };

    // substitution :: (item, comparator) -> item
    // example is the location of the cursor (the row index)
    // index is the insert position (at - or after - example) (the row index)
    var insertRowsAt = function (grid, index, rows, example, comparator, substitution) {
      var before = Arr.map(grid.slice(0, index), nonNewCells);
      var after = Arr.map(grid.slice(index), nonNewCells);

      var between = Util.repeat(rows, function () {
        return GridRow.mapCells(grid[example], function (ex, c) {
          var withinSpan = index > 0 && index < grid.length && comparator(GridRow.getCell(grid[index - 1], c), GridRow.getCell(grid[index], c));
          return withinSpan ? Structs.elementnew(GridRow.getCell(grid[index], c), false) : Structs.elementnew(substitution(ex, comparator), true);
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
      var before = Arr.map(grid.slice(0, index), nonNewCells);
      var after = Arr.map(grid.slice(index), nonNewCells);

      var between = GridRow.mapCells(grid[exampleRow], function (ex, i) {
        var isTargetCell = (i === exampleCol);
        return isTargetCell ? Structs.elementnew(substitution(ex, comparator), true) : Structs.elementnew(ex, false);
      });

      return before.concat([ between ]).concat(after);
    };

    var deleteColumnsAt = function (grid, start, finish) {
      var rows = Arr.map(grid, function (row) {
        var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
        var newCells = Arr.map(cells, function (cell) {
          return Structs.elementnew(cell, false);
        });
        return Structs.rowcells(newCells, row.section());
      });
      // We should filter out rows that have no columns for easy deletion
      return Arr.filter(rows, function (row) {
        return row.cells().length > 0;
      });
    };

    var deleteRowsAt = function (grid, start, finish) {
      var rows = grid.slice(0, start).concat(grid.slice(finish + 1));
      return Arr.map(rows, function (row) {
        return GridRow.mapCells(row, function (cell) { return Structs.elementnew(cell, false); });
      });
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