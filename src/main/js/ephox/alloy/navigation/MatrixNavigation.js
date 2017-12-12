import Cycles from '../alien/Cycles';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var outcome = Struct.immutableBag([ 'rowIndex', 'columnIndex', 'cell' ], [ ]);

var toCell = function (matrix, rowIndex, columnIndex) {
  return Option.from(matrix[rowIndex]).bind(function (row) {
    return Option.from(row[columnIndex]).map(function (cell) {
      return outcome({
        rowIndex: rowIndex,
        columnIndex: columnIndex,
        cell: cell
      });
    });
  });
};

var cycleHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
  var row = matrix[rowIndex];
  var colsInRow = row.length;
  var newColIndex = Cycles.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
  return toCell(matrix, rowIndex, newColIndex);
};

var cycleVertical = function (matrix, colIndex, startRow, deltaRow) {
  var nextRowIndex = Cycles.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
  var colsInNextRow = matrix[nextRowIndex].length;
  var nextColIndex = Cycles.cap(colIndex, 0, colsInNextRow - 1);
  return toCell(matrix, nextRowIndex, nextColIndex);
};

var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
  var row = matrix[rowIndex];
  var colsInRow = row.length;
  var newColIndex = Cycles.cap(startCol + deltaCol, 0, colsInRow - 1);
  return toCell(matrix, rowIndex, newColIndex);
};

var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
  var nextRowIndex = Cycles.cap(startRow + deltaRow, 0, matrix.length - 1);
  var colsInNextRow = matrix[nextRowIndex].length;
  var nextColIndex = Cycles.cap(colIndex, 0, colsInNextRow - 1);
  return toCell(matrix, nextRowIndex, nextColIndex);
};

// return address(Math.floor(index / columns), index % columns);
var cycleRight = function (matrix, startRow, startCol) {
  return cycleHorizontal(matrix, startRow, startCol, +1);
};

var cycleLeft = function (matrix, startRow, startCol) {
  return cycleHorizontal(matrix, startRow, startCol, -1);
};

var cycleUp = function (matrix, startRow, startCol) {
  return cycleVertical(matrix, startCol, startRow, -1);
};

var cycleDown = function (matrix, startRow, startCol) {
  return cycleVertical(matrix, startCol, startRow, +1);
};

var moveLeft = function (matrix, startRow, startCol) {
  return moveHorizontal(matrix, startRow, startCol, -1);
};

var moveRight = function (matrix, startRow, startCol) {
  return moveHorizontal(matrix, startRow, startCol, +1);
};

var moveUp = function (matrix, startRow, startCol) {
  return moveVertical(matrix, startCol, startRow, -1);
};

var moveDown = function (matrix, startRow, startCol) {
  return moveVertical(matrix, startCol, startRow, +1);
};

export default <any> {
  cycleRight: cycleRight,
  cycleLeft: cycleLeft,
  cycleUp: cycleUp,
  cycleDown: cycleDown,

  moveLeft: moveLeft,
  moveRight: moveRight,
  moveUp: moveUp,
  moveDown: moveDown
};