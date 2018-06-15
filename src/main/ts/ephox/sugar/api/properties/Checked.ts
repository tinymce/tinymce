import SelectorFind from '../search/SelectorFind';
import Element from '../node/Element';
import { HTMLInputElement } from '@ephox/dom-globals';

var set = function (element: Element, status: boolean) {
  (element.dom() as HTMLInputElement).checked = status;
};

var find = function (parent: Element) {
  // :checked selector requires IE9
  // http://www.quirksmode.org/css/selectors/#t60
  return SelectorFind.descendant(parent, 'input:checked');
};

export default <any> {
  set: set,
  find: find
};