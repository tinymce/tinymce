import { Fun } from '@ephox/katamari';
import { Attribute, Css, SugarElement } from '@ephox/sugar';

export const getAttrValue = (cell: SugarElement, name: string, fallback: number = 0) =>
  Attribute.getOpt(cell, name).map((value) => parseInt(value, 10)).getOr(fallback);

export const getSpan = (cell: SugarElement, type: 'colspan' | 'rowspan') => getAttrValue(cell, type, 1);

export const hasColspan = (cell: SugarElement) => getSpan(cell, 'colspan') > 1;

export const hasRowspan = (cell: SugarElement) => getSpan(cell, 'rowspan') > 1;

export const getCssValue = (element: SugarElement, property: string) => parseInt(Css.get(element, property), 10);

export const minWidth = Fun.constant(10);
export const minHeight = Fun.constant(10);
