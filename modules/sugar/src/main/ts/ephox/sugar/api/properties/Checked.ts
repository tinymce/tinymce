import { HTMLInputElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as SelectorFind from '../search/SelectorFind';
import { Option } from '@ephox/katamari';

const set = (element: Element<HTMLInputElement>, status: boolean): void => {
  element.dom().checked = status;
};

// :checked selector requires IE9
// http://www.quirksmode.org/css/selectors/#t60
const find = (parent: Element<DomNode>): Option<Element<HTMLInputElement>> =>
  SelectorFind.descendant<HTMLInputElement>(parent, 'input:checked');

export {
  set,
  find
};
