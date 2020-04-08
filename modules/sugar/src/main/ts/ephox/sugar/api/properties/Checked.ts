import { HTMLInputElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as SelectorFind from '../search/SelectorFind';

const set = (element: Element<HTMLInputElement>, status: boolean) => {
  element.dom().checked = status;
};

// :checked selector requires IE9
// http://www.quirksmode.org/css/selectors/#t60
const find = (parent: Element<DomNode>) => SelectorFind.descendant<HTMLInputElement>(parent, 'input:checked');

export {
  set,
  find
};
