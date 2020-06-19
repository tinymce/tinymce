import { HTMLElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { SelectorFilter, Attr, Compare, Element } from '@ephox/sugar';

const getPixelWidth = (elm: HTMLElement) => elm.getBoundingClientRect().width;
const getPixelHeight = (elm: HTMLElement) => elm.getBoundingClientRect().height;

const getIsRoot = (editorBody: Element<any>) => (element: Element<any>) => Compare.eq(element, editorBody);

const removeDataStyle = (table: Element<HTMLTableElement>, styleAttribute: string) => {
  const dataStyleCells = SelectorFilter.descendants(table, `td[${styleAttribute}],th[${styleAttribute}]`);
  Attr.remove(table, styleAttribute);
  Arr.each(dataStyleCells, (cell) => Attr.remove(cell, styleAttribute));
};

export {
  getIsRoot,
  getPixelWidth,
  getPixelHeight,
  removeDataStyle
};
