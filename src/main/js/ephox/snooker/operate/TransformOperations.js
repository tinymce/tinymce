define(
  'ephox.snooker.operate.TransformOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.GridRow'
  ],

  function (Arr, Fun, Structs, GridRow) {
    // substitution :: (item, comparator) -> item
    var replaceIn = function (grid, targets, comparator, substitution) {
      var isTarget = function (elem) {
        return Arr.exists(targets, Fun.curry(comparator, elem));
      };

      return Arr.map(grid, function (row) {
        return GridRow.mapCells(row, function (cell) {
          return isTarget(cell) ? Structs.elementnew(substitution(cell, comparator), true) : Structs.elementnew(cell, false);
        });
      });
    };

    var notStartRow = function (grid, rowIndex, colIndex, comparator) {
      return GridRow.getCell(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCell(grid[rowIndex - 1], colIndex), GridRow.getCell(grid[rowIndex], colIndex)));
    };

    var notStartColumn = function (row, index, comparator) {
      return index > 0 && comparator(GridRow.getCell(row, index - 1), GridRow.getCell(row, index));
    };

    // substitution :: (item, comparator) -> item
    var replaceColumn = function (grid, index, comparator, substitution) {
      // Make this efficient later.
      var targets = Arr.bind(grid, function (row, i) {
        // check if already added.
        var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
        return alreadyAdded ? [] : [ GridRow.getCell(row, index) ];
      });

      return replaceIn(grid, targets, comparator, substitution);
    };

    // substitution :: (item, comparator) -> item
    var replaceRow = function (grid, index, comparator, substitution) {
      var targetRow = grid[index];
      var targets = Arr.bind(targetRow.cells(), function (item, i) {
        // Check that we haven't already added this one.
        var alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
        return alreadyAdded ? [] : [ item ];
      });

      return replaceIn(grid, targets, comparator, substitution);
    };

    return {
      replaceColumn: replaceColumn,
      replaceRow: replaceRow
    };
  }
);