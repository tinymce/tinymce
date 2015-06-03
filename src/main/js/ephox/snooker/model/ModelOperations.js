define(
  'ephox.snooker.model.ModelOperations',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.Divide',
    'ephox.snooker.model.Impera'
  ],

  function (Fun, Divide, Impera) {
    var insertRowAt = function (grid, index, substitution) {

    };

    var insertColumnAt = function (grid, index, substitution) {

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
      insertColumnAt: Fun.noop,
      deleteColumnAt: Fun.noop,
      deleteRowAt: Fun.noop
    };
  }
);