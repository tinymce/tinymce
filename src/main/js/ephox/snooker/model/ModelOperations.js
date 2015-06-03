define(
  'ephox.snooker.model.ModelOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Divide',
    'ephox.snooker.model.Impera'
  ],

  function (Arr, Fun, Divide, Impera) {
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

    var merge = function (grid, bounds, lead, comparator) {
      return Impera.render(grid, bounds, lead, comparator);
    };

    var unmerge = function (grid, target, comparator, substitution) {
      return Divide.generate(grid, target, comparator, substitution);
    };

    return {
      merge: Impera.render,
      unmerge: Divide.generate,
      insertRowAt: insertRowAt,
      insertColumnAt: insertColumnAt,
      deleteColumnAt: deleteColumnAt,
      deleteRowAt: deleteRowAt
    };
  }
);