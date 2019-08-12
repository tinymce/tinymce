import * as SelectorFind from '../search/SelectorFind';
import Element from '../node/Element';
import { HTMLInputElement, Node as DomNode } from '@ephox/dom-globals';

const set = function (element: Element<HTMLInputElement>, status: boolean) {
  element.dom().checked = status;
};

const find = function (parent: Element<DomNode>) {
  // :checked selector requires IE9
  // http://www.quirksmode.org/css/selectors/#t60
  return SelectorFind.descendant<HTMLInputElement>(parent, 'input:checked');
};

export {
  set,
  find,
};