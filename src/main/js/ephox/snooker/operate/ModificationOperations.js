define(
  'ephox.snooker.operate.ModificationOperations',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var insertRowAt = function (grid, index, example, comparator, substitution) {
      var before = grid.slice(0, index);
      var after = grid.slice(index);

      var between = Arr.map(grid[example], function (ex, c) {
        var withinSpan = index > 0 && index < grid.length && comparator(grid[index - 1][c], grid[index][c]);
        return withinSpan ? grid[index][c] : substitution.getOrInit(ex, comparator);
      });

      return before.concat([ between ]).concat(after);
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

    return {
      insertRowAt: insertRowAt,
      insertColumnAt: insertColumnAt,
      deleteRowAt: deleteRowAt,
      deleteColumnAt: deleteColumnAt
    };
  }
);