define(
  'ephox.snooker.activate.Water',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.activate.ColumnContext',
    'global!Math'
  ],

  function (Fun, ColumnContext, Math) {
    var neighbours = function (input, index) {
      if (input.length === 0) return ColumnContext.none();
      if (input.length === 1) return ColumnContext.only();
      if (index === 0) return ColumnContext.left(0, 1);
      if (index === input.length - 1) return ColumnContext.right(index - 1, index);
      if (index > 0 && index < input.length - 1) return ColumnContext.middle(index - 1, index, index + 1);
      return ColumnContext.none();
    };

    /* Just hacking around atm */
    var water = function (input, column, step, min) {
      var result = input.slice(0);

      var context = neighbours(input, column);

      var onNone = Fun.constant(result);
      var onOnly = function (index) {
        return Math.max(min, [ result[index] + step ]);
      };

      var onLeft = function (index, next) {
        if (step >= 0) {
          var newNext = Math.max(min, result[next] - step);
          return result.slice(0, index).concat([ result[index] + step, newNext ].concat(result.slice(next + 1)));
        } else {
          var newThis = Math.max(min, result[index] + step);
          var diffx = result[index] - newThis;
          return [ newThis, result[next] + diffx ].concat(result.slice(next + 1));
        }
      };

      return context.fold(onNone, onOnly, onLeft, onNone, onNone);
    };

    return {
      water: water
    };
  }
);
