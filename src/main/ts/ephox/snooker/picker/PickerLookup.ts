import Structs from '../api/Structs';
import PickerStyles from './PickerStyles';
import { Attr } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

var CELL_SELECTOR = '.' + PickerStyles.cell();
var ROW_SELECTOR = '.' + PickerStyles.row();

// TODO: refactor to build up references at picker creation time (PickerUi.recreate)

var cells = function (ancestor) {
  return SelectorFilter.descendants(ancestor, CELL_SELECTOR);
};

var rows = function (ancestor) {
  return SelectorFilter.descendants(ancestor, ROW_SELECTOR);
};

var attr = function (element, property) {
  return parseInt(Attr.get(element, property), 10);
};

var grid = function (element, rowProp, colProp) {
  var rows = attr(element, rowProp);
  var cols = attr(element, colProp);
  return Structs.grid(rows, cols);
};

var button = function (cell) {
  return SelectorFind.child(cell, '.' + PickerStyles.button()).getOr(cell);
};

export default {
  cells: cells,
  rows: rows,
  grid: grid,
  button: button
};