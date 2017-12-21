import Cycles from '../alien/Cycles';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

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
    var newColumn = Cycles.cycleBy(oldColumn, delta, 0, colsInRow - 1);
    return Option.some({
      row: Fun.constant(oldRow),
      column: Fun.constant(newColumn)
    });
  });
};

var cycleVertical = function (values, index, numRows, numCols, delta) {
  return withGrid(values, index, numCols, function (oldRow, oldColumn) {
    var newRow = Cycles.cycleBy(oldRow, delta, 0, numRows - 1);
    var onLastRow = newRow === numRows - 1;
    var colsInRow = onLastRow ? values.length - (newRow * numCols) : numCols;
    var newCol = Cycles.cap(oldColumn, 0, colsInRow - 1);
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

export default <any> {
  cycleDown: cycleDown,
  cycleUp: cycleUp,
  cycleLeft: cycleLeft,
  cycleRight: cycleRight
};