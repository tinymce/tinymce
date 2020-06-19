import { HTMLElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { SelectorFilter, Attr, Compare, Element } from '@ephox/sugar';

const getPixelWidth = (elm: HTMLElement) => elm.getBoundingClientRect().width;
const getPixelHeight = (elm: HTMLElement) => elm.getBoundingClientRect().height;

const getIsRoot = (editorBody: Element<any>) => (element: Element<any>) => Compare.eq(element, editorBody);

const removeDataStyle = (table: Element<HTMLTableElement>) => {
  const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
  Attr.remove(table, 'data-mce-style');
  Arr.each(dataStyleCells, (cell) => Attr.remove(cell, 'data-mce-style'));
};

export {
  getIsRoot,
  getPixelWidth,
  getPixelHeight,
  removeDataStyle
};
