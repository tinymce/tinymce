import { Fun } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';

var getSpan = function (cell, type) {
  return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
};

var hasColspan = function (cell) {
  return getSpan(cell, 'colspan');
};

var hasRowspan = function (cell) {
  return getSpan(cell, 'rowspan');
};

var getInt = function (element, property) {
  return parseInt(Css.get(element, property), 10);
};

export default {
  hasColspan: hasColspan,
  hasRowspan: hasRowspan,
  minWidth: Fun.constant(10),
  minHeight: Fun.constant(10),
  getInt: getInt
};