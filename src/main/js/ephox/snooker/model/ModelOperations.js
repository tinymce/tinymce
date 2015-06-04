define(
  'ephox.snooker.model.ModelOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = grid.slice(0, index);

      var after = grid.slice(index);
      console.log('index: ', index, 'example', example);
      var nu = Arr.map(grid[example], function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(grid[index - 1][c], grid[index][c]);
        return withinSpan ? grid[index][c] : substitution.getOrInit(ex, comparator);
      });

      return before.concat([ nu ]).concat(after);
    };

    var insertColumnAt = function (grid, index, example, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < row.length && comparator(row[index - 1], row[index]);
        var sub = withinSpan ? row[index] : substitution.getOrInit(row[example], comparator);
        return row.slice(0, index).concat([ sub ]).concat(row.slice(index));
      });
    };

    var deleteColumnAt = function (grid, index) {
      return Arr.map(grid, function (row) {
        return row.slice(0, index).concat(row.slice(index + 1));
      });
    };

    var deleteRowAt = function (grid, index) {
      return grid.slice(0, index).concat(grid.slice(index + 1));
    };

    var merge = function (grid, bounds, comparator, substitution) {
      // Mutating. Do we care about the efficiency gain?
      if (grid.length === 0) return grid;
      for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
        for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
          // We can probably simplify this again now that we aren't reusing merge.
          grid[i][j] = substitution(grid[i][j], comparator);
        }
      }
      return grid;
    };

    var unmerge = function (grid, target, comparator, substitution) {
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

    var replaceIn = function (grid, targets, comparator, substitution) {
      var isTarget = function (elem) {
        return Arr.exists(targets, Fun.curry(comparator, elem));
      };

      return Arr.map(grid, function (row) {
        return Arr.map(row, function (cell) {
          return isTarget(cell) ? substitution.replaceOrInit(cell, comparator) : cell;
        });
      });
    };

    var isBetweenRow = function (grid, rowIndex, colIndex, comparator) {
      return grid[rowIndex][colIndex] !== undefined && (rowIndex > 0 && comparator(grid[rowIndex - 1][colIndex], grid[rowIndex][colIndex]));
    };

    var isBetweenColumn = function (row, index, comparator) {
      return index > 0 && comparator(row[index-1], row[index]);
    };

    var replaceColumn = function (grid, index, comparator, substitution) {
      // Make this efficient later.
      var targets = Arr.bind(grid, function (row, i) {
        // check if already added.
        var alreadyAdded = isBetweenRow(grid, i, index, comparator) || isBetweenColumn(row, index, comparator);
        return alreadyAdded ? [] : [ row[index] ];
      });

      return replaceIn(grid, targets, comparator, substitution);
    };

    var replaceRow = function (grid, index, comparator, substitution) {
      var targetRow = grid[index];
      var targets = Arr.bind(targetRow, function (item, i) {
        // Check that we haven't already added this one.
        var alreadyAdded = isBetweenRow(grid, index, i, comparator) || isBetweenColumn(targetRow, i, comparator);
        return alreadyAdded ? [] : [ item ];
      });

      return replaceIn(grid, targets, comparator, substitution);
    };

    return {
      merge: merge,
      unmerge: unmerge,
      insertRowAt: insertRowAt,
      insertColumnAt: insertColumnAt,
      deleteColumnAt: deleteColumnAt,
      deleteRowAt: deleteRowAt,
      replaceColumn: replaceColumn,
      replaceRow: replaceRow
    };
  }
);