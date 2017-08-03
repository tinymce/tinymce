define(
  'ephox.snooker.operate.MergingOperations',

  [
    'ephox.snooker.model.GridRow'
  ],

  function (GridRow) {
    // substitution: () -> item
    var merge = function (grid, bounds, comparator, substitution) {
      // Mutating. Do we care about the efficiency gain?
      if (grid.length === 0) return grid;
      for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
        for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
          // We can probably simplify this again now that we aren't reusing merge.
          GridRow.mutateCell(grid[i], j, substitution());
        }
      }
      return grid;
    };

    // substitution: () -> item
    var unmerge = function (grid, target, comparator, substitution) {
      // Mutating. Do we care about the efficiency gain?
      var first = true;
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < GridRow.cellLength(grid[0]); j++) {
          var current = GridRow.getCell(grid[i], j);
          var isToReplace = comparator(current, target);

          if (isToReplace === true && first === false) GridRow.mutateCell(grid[i], j, substitution());
          else if (isToReplace === true) first = false;
        }
      }
      return grid;
    };

    return {
      merge: merge,
      unmerge: unmerge
    };
  }
);