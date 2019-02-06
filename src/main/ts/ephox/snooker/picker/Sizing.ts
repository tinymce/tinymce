import { Fun } from '@ephox/katamari';
import Structs from '../api/Structs';

var translate = function (cell, row, column) {
  return Structs.address(cell.row() + row, cell.column() + column);
};

var validate = function (cell, minX, maxX, minY, maxY) {
  var row =  Math.max(minY, Math.min(maxY, cell.row()));
  var col = Math.max(minX, Math.min(maxX, cell.column()));
  return Structs.address(row, col);
};

var process = function (newSize, settings) {
  var selection = validate(newSize, 1, settings.maxCols, 1, settings.maxRows);
  var full = validate(translate(selection, 1, 1), settings.minCols, settings.maxCols, settings.minRows, settings.maxRows);
  return {
    selection: Fun.constant(selection),
    full: Fun.constant(full)
  };
};

/*
 * Given a (row, column) address of the current mouse, identify the table size
 * and current selection.
 */
var resize = function (address, settings) {
  var newSize = translate(address, 1, 1);
  return process(newSize, settings);
};

var grow = function (selected, xDelta, yDelta, settings) {
  var newSize = Structs.address(selected.rows() + yDelta, selected.columns() + xDelta);
  return process(newSize, settings);
};

export default {
  resize: resize,
  grow: grow
};