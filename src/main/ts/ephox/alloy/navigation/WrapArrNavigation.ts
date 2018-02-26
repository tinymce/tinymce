import { Fun, Option } from '@ephox/katamari';

import * as Cycles from '../alien/Cycles';

const withGrid = function (values, index, numCols, f) {
  const oldRow = Math.floor(index / numCols);
  const oldColumn = index % numCols;

  return f(oldRow, oldColumn).bind(function (address) {
    const newIndex = address.row() * numCols + address.column();
    return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
  });
};

const cycleHorizontal = function (values, index, numRows, numCols, delta) {
  return withGrid(values, index, numCols, function (oldRow, oldColumn) {
    const onLastRow = oldRow === numRows - 1;
    const colsInRow = onLastRow ? values.length - (oldRow * numCols) : numCols;
    const newColumn = Cycles.cycleBy(oldColumn, delta, 0, colsInRow - 1);
    return Option.some({
      row: Fun.constant(oldRow),
      column: Fun.constant(newColumn)
    });
  });
};

const cycleVertical = function (values, index, numRows, numCols, delta) {
  return withGrid(values, index, numCols, function (oldRow, oldColumn) {
    const newRow = Cycles.cycleBy(oldRow, delta, 0, numRows - 1);
    const onLastRow = newRow === numRows - 1;
    const colsInRow = onLastRow ? values.length - (newRow * numCols) : numCols;
    const newCol = Cycles.cap(oldColumn, 0, colsInRow - 1);
    return Option.some({
      row: Fun.constant(newRow),
      column: Fun.constant(newCol)
    });
  });
};

const cycleRight = function (values, index, numRows, numCols) {
  return cycleHorizontal(values, index, numRows, numCols, +1);
};

const cycleLeft = function (values, index, numRows, numCols) {
  return cycleHorizontal(values, index, numRows, numCols, -1);
};

const cycleUp = function (values, index, numRows, numCols) {
  return cycleVertical(values, index, numRows, numCols, -1);
};

const cycleDown = function (values, index, numRows, numCols) {
  return cycleVertical(values, index, numRows, numCols, +1);
};

export {
  cycleDown,
  cycleUp,
  cycleLeft,
  cycleRight
};