import { Fun } from '@ephox/katamari';
import { Attr, Css } from '@ephox/sugar';

const getSpan = function (cell, type) {
  return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
};

const hasColspan = function (cell) {
  return getSpan(cell, 'colspan');
};

const hasRowspan = function (cell) {
  return getSpan(cell, 'rowspan');
};

const getInt = function (element, property) {
  return parseInt(Css.get(element, property), 10);
};

export default {
  hasColspan,
  hasRowspan,
  minWidth: Fun.constant(10),
  minHeight: Fun.constant(10),
  getInt
};