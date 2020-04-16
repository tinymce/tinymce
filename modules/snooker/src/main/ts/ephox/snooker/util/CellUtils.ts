import { Fun } from '@ephox/katamari';
import { Attr, Css, Element } from '@ephox/sugar';

export const getAttrValue = (cell: Element, name: string, fallback: number = 0) =>
  Attr.getOpt(cell, name).map((value) => parseInt(value, 10)).getOr(fallback);

export const getSpan = (cell: Element, type: 'colspan' | 'rowspan') => getAttrValue(cell, type, 1);

export const hasColspan = (cell: Element) => getSpan(cell, 'colspan') > 1;

export const hasRowspan = (cell: Element) => getSpan(cell, 'rowspan') > 1;

export const getCssValue = (element: Element, property: string) => parseInt(Css.get(element, property), 10);

export const minWidth = Fun.constant(10);
export const minHeight = Fun.constant(10);
