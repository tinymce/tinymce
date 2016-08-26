define(
  'ephox.alloy.navigation.ArrNavigation',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Arr, Option, Math) {
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

    // TODO: property tests

    // return address(Math.floor(index / columns), index % columns);
    var cycleRight = function (values, index, numRows, numColumns, predicate) {
      return cycleGrid(values, index, numRows, numColumns, +1, 0, predicate);
    };

    var cycleLeft = function (values, index, numRows, numColumns, predicate) {
      return cycleGrid(values, index, numRows, numColumns, -1, 0, predicate);
    };

    var cycleUp = function (values, index, numRows, numColumns, predicate) {
      return cycleGrid(values, index, numRows, numColumns, 0, -1, predicate);
    };

    var cycleDown = function (values, index, numRows, numColumns, predicate) {
      return cycleGrid(values, index, numRows, numColumns, 0, +1, predicate);
    };

    var cycleGrid = function (values, index, numRows, numColumns, dx, dy, predicate) {
      var oldRow = Math.floor(index / numColumns);
      var oldColumn = index % numColumns;

      var newRow = cycleBy(oldRow, dy, 0, numRows - 1);
      // Note, the grid may be irregular, so if we are on the last row, the number 
      // of columns may not be the same as the previous row.
      // Therefore, if we are only travelling vertically, cap the column at colsInRow
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - (newRow * numColumns) : numColumns;
      var newColumn = dx !== 0 ? cycleBy(oldColumn, dx, 0, colsInRow - 1) : cap(oldColumn, 0, colsInRow - 1);
      var newIndex = newRow * numColumns + newColumn;
      return newIndex >= 0 && newIndex < values.length ? Option.some(newIndex) : Option.none();
    };

    return {
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