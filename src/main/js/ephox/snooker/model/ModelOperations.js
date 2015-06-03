define(
  'ephox.snooker.model.ModelOperations',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Divide',
    'ephox.snooker.model.Impera'
  ],

  function (Arr, Fun, Divide, Impera) {
    var insertRowAt = function (grid, index, substitution) {

    };

    var insertColumnAt = function (grid, index, comparator, substitution) {
      return Arr.map(grid, function (row) {
        var withinSpan = index > 0 && index < row.length && comparator(row[index - 1], row[index]);
        var sub = withinSpan ? row[index] : substitution();
        return row.slice(0, index).concat([ sub ]).concat(row.slice(index));
      });
    };

    var deleteColumnAt = function (grid, index) {

    };

    var deleteRowAt = function (grid, index) {

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
      insertRowAt: Fun.noop,
      insertColumnAt: insertColumnAt,
      deleteColumnAt: Fun.noop,
      deleteRowAt: Fun.noop
    };
  }
);