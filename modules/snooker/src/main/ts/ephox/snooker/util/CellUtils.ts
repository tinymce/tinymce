import { Fun } from '@ephox/katamari';
import { Attr, Css, Element } from '@ephox/sugar';

export const getSpan = function (cell: Element, type: 'colspan' | 'rowspan') {
  return Attr.has(cell, type) && parseInt(Attr.get(cell, type), 10) > 1;
};

export const hasColspan = function (cell: Element) {
  return getSpan(cell, 'colspan');
};

export const hasRowspan = function (cell: Element) {
  return getSpan(cell, 'rowspan');
};

export const getInt = function (element: Element, property: string) {
  return parseInt(Css.get(element, property), 10);
};

export const minWidth = Fun.constant(10);
export const minHeight = Fun.constant(10);
