import { Fun } from '@ephox/katamari';
import { Attr, Css, Element } from '@ephox/sugar';

const getSpan = function (cell: Element, type: 'colspan' | 'rowspan') {
  return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
};

const hasColspan = function (cell: Element) {
  return getSpan(cell, 'colspan');
};

const hasRowspan = function (cell: Element) {
  return getSpan(cell, 'rowspan');
};

const getInt = function (element: Element, property: string) {
  return parseInt(Css.get(element, property), 10);
};

export default {
  hasColspan,
  hasRowspan,
  minWidth: Fun.constant(10),
  minHeight: Fun.constant(10),
  getInt
};