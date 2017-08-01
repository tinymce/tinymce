define(
  'ephox.snooker.operate.TransformOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs'
  ],

  function (Arr, Fun, Structs) {
    // substitution :: (item, comparator) -> item
    var replaceIn = function (grid, targets, comparator, substitution) {
      var isTarget = function (elem) {
        return Arr.exists(targets, Fun.curry(comparator, elem));
      };

      return Arr.map(grid, function (row) {
        var cells = Arr.map(row.cells(), function (cell) {
          return isTarget(cell) ? substitution(cell, comparator) : cell;
        });
        return Structs.rowcells(cells, row.section());
      });
    };

    var notStartRow = function (grid, rowIndex, colIndex, comparator) {
      return grid[rowIndex].cells()[colIndex] !== undefined && (rowIndex > 0 && comparator(grid[rowIndex - 1].cells()[colIndex], grid[rowIndex].cells()[colIndex]));
    };

    var notStartColumn = function (row, index, comparator) {
      return index > 0 && comparator(row.cells()[index-1], row.cells()[index]);
    };

    // substitution :: (item, comparator) -> item
    var replaceColumn = function (grid, index, comparator, substitution) {
      // Make this efficient later.
      var targets = Arr.bind(grid, function (row, i) {
        // check if already added.
        var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
        return alreadyAdded ? [] : [ row.cells()[index] ];
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