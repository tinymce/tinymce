import { Fun } from '@ephox/katamari';
import { Attribute, Css, SugarElement } from '@ephox/sugar';

export const getAttrValue = (cell: SugarElement<Element>, name: string, fallback: number = 0): number =>
  Attribute.getOpt(cell, name).map((value) => parseInt(value, 10)).getOr(fallback);

export const getSpan = (cell: SugarElement<HTMLTableCellElement>, type: 'colspan' | 'rowspan'): number =>
  getAttrValue(cell, type, 1);

export const hasColspan = (cell: SugarElement<HTMLTableCellElement>): boolean =>
  getSpan(cell, 'colspan') > 1;

export const hasRowspan = (cell: SugarElement<HTMLTableCellElement>): boolean =>
  getSpan(cell, 'rowspan') > 1;

export const getCssValue = (element: SugarElement<Element>, property: string): number =>
  parseInt(Css.get(element, property), 10);

export const minWidth = Fun.constant(10);
export const minHeight = Fun.constant(10);
