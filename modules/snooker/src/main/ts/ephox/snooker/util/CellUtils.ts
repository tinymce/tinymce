import { Fun } from '@ephox/katamari';
import { Attr, Css, Element } from '@ephox/sugar';

export const getAttrValue = (cell: Element, name: string, fallback: number = 0) => {
  return Attr.getOpt(cell, name).map((value) => parseInt(value, 10)).getOr(fallback);
};

export const getSpan = (cell: Element, type: 'colspan' | 'rowspan') => {
  return getAttrValue(cell, type, 1);
};

export const hasColspan = (cell: Element) => {
  return getSpan(cell, 'colspan') > 1;
};

export const hasRowspan = (cell: Element) => {
  return getSpan(cell, 'rowspan') > 1;
};

export const getCssValue = (element: Element, property: string) => {
  return parseInt(Css.get(element, property), 10);
};

export const minWidth = Fun.constant(10);
export const minHeight = Fun.constant(10);
