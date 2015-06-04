define(
  'ephox.snooker.operate.MergingOperations',

  [

  ],

  function () {
    // substitution: () -> item
    var merge = function (grid, bounds, comparator, substitution) {
      // Mutating. Do we care about the efficiency gain?
      if (grid.length === 0) return grid;
      for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
        for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
          // We can probably simplify this again now that we aren't reusing merge.
          grid[i][j] = substitution();
        }
      }
      return grid;
    };

    // substitution: () -> item
    var unmerge = function (grid, target, comparator, substitution) {
      console.log('substitution', substitution);
      // Mutating. Do we care about the efficiency gain?
      var first = true;
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[0].length; j++) {
          var current = grid[i][j];
          var isToReplace = comparator(current, target);

          if (isToReplace === true && first === false) grid[i][j] = substitution();
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