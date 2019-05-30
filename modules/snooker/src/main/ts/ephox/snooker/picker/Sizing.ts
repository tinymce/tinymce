import { Fun } from '@ephox/katamari';
import Structs from '../api/Structs';

const translate = function (cell, row, column) {
  return Structs.address(cell.row() + row, cell.column() + column);
};

const validate = function (cell, minX, maxX, minY, maxY) {
  const row =  Math.max(minY, Math.min(maxY, cell.row()));
  const col = Math.max(minX, Math.min(maxX, cell.column()));
  return Structs.address(row, col);
};

const process = function (newSize, settings) {
  const selection = validate(newSize, 1, settings.maxCols, 1, settings.maxRows);
  const full = validate(translate(selection, 1, 1), settings.minCols, settings.maxCols, settings.minRows, settings.maxRows);
  return {
    selection: Fun.constant(selection),
    full: Fun.constant(full)
  };
};

/*
 * Given a (row, column) address of the current mouse, identify the table size
 * and current selection.
 */
const resize = function (address, settings) {
  const newSize = translate(address, 1, 1);
  return process(newSize, settings);
};

const grow = function (selected, xDelta, yDelta, settings) {
  const newSize = Structs.address(selected.rows() + yDelta, selected.columns() + xDelta);
  return process(newSize, settings);
};

export default {
  resize,
  grow
};