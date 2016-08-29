define(
  'ephox.alloy.navigation.ArrNavigation',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Arr, Fun, Option, Math) {
    var cycleBy = function (value, delta, min, max) {
      var r = value + delta;
      if (r > max) return min;
      else if (r < min) return max;
      return r;
    };

    var cap = function (value, min, max) {
      if (value <= min) return min;
      else if (value >= max) return max;
      else return value;
    };

     // TODO: Use katamari once find is fixed
    var findIn = function (array, predicate) {
      var r = Arr.find(array, predicate);
      return r !== undefined && r !== null ? Option.some(r) : Option.none();
    };

    var cyclePrev = function (values, index, predicate) {
      var before = Arr.reverse(values.slice(0, index));
      var after = Arr.reverse(values.slice(index + 1));
      return findIn(before.concat(after), predicate);
    };

    var tryPrev = function (values, index, predicate) {
      var before = Arr.reverse(values.slice(0, index));
      return findIn(before, predicate);
    };

    var cycleNext = function (values, index, predicate) {
      var before = values.slice(0, index);
      var after = values.slice(index + 1);
      // TODO: Use katamari once find is fixed
      return findIn(after.concat(before), predicate);
    };

    var tryNext = function (values, index, predicate) {
      var after = values.slice(index + 1);
      return findIn(after, predicate);
    };

    var withGrid = function (values, index, numCols, f) {
      var oldRow = Math.floor(index / numCols);
      var oldColumn = index % numCols;

      return f(oldRow, oldColumn).bind(function (address) {
        var newIndex = address.row() * numCols + address.column();
        return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
      });
    };

    var cycleHorizontal = function (values, index, numRows, numCols, delta) {
      return withGrid(values, index, numCols, function (oldRow, oldColumn) {
        var onLastRow = oldRow === numRows - 1;
        var colsInRow = onLastRow ? values.length - (oldRow * numCols) : numCols;
        var newColumn = cycleBy(oldColumn, delta, 0, colsInRow - 1);
        return Option.some({
          row: Fun.constant(oldRow),
          column: Fun.constant(newColumn)
        });
      });
    };

    var cycleVertical = function (values, index, numRows, numCols, delta) {
      return withGrid(values, index, numCols, function (oldRow, oldColumn) {
        var newRow = cycleBy(oldRow, delta, 0, numRows - 1);
        var onLastRow = newRow === numRows - 1;
        var colsInRow = onLastRow ? values.length - (newRow * numCols) : numCols;
        var newCol = cap(oldColumn, 0, colsInRow - 1);
        return Option.some({
          row: Fun.constant(newRow),
          column: Fun.constant(newCol)
        });
      });
    };

    var cycleRight = function (values, index, numRows, numCols) {
      return cycleHorizontal(values, index, numRows, numCols, +1);
    };

    var cycleLeft = function (values, index, numRows, numCols) {
      return cycleHorizontal(values, index, numRows, numCols, -1);
    };

    var cycleUp = function (values, index, numRows, numCols) {
      return cycleVertical(values, index, numRows, numCols, -1);
    };

    var cycleDown = function (values, index, numRows, numCols) {
      return cycleVertical(values, index, numRows, numCols, +1);
    };

    return {
      // Probably move.
      cap: cap,

      cycleBy: cycleBy,
      cyclePrev: cyclePrev,
      cycleNext: cycleNext,
      tryPrev: tryPrev,
      tryNext: tryNext,

      cycleDown: cycleDown,
      cycleUp: cycleUp,
      cycleLeft: cycleLeft,
      cycleRight: cycleRight
    };
  }
);