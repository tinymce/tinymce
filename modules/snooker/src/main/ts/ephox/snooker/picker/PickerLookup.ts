import { Attr, SelectorFilter, SelectorFind, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import PickerStyles from './PickerStyles';

const CELL_SELECTOR = '.' + PickerStyles.cell();
const ROW_SELECTOR = '.' + PickerStyles.row();

// TODO: refactor to build up references at picker creation time (PickerUi.recreate)

const cells = function (ancestor: Element) {
  return SelectorFilter.descendants(ancestor, CELL_SELECTOR);
};

const rows = function (ancestor: Element) {
  return SelectorFilter.descendants(ancestor, ROW_SELECTOR);
};

const attr = function (element: Element, property: string) {
  return parseInt(Attr.get(element, property), 10);
};

const grid = function (element: Element, rowProp: string, colProp: string) {
  const rowsCount = attr(element, rowProp);
  const cols = attr(element, colProp);
  return Structs.grid(rowsCount, cols);
};

const button = function (cell: Element) {
  return SelectorFind.child(cell, '.' + PickerStyles.button()).getOr(cell);
};

export default {
  cells,
  rows,
  grid,
  button
};