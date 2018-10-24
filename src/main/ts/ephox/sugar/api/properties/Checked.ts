import * as SelectorFind from '../search/SelectorFind';
import Element from '../node/Element';
import { HTMLInputElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

var set = function (element: Element, status: boolean) {
  (element.dom() as HTMLInputElement).checked = status;
};

var find = function (parent: Element): Option<Element> {
  // :checked selector requires IE9
  // http://www.quirksmode.org/css/selectors/#t60
  return SelectorFind.descendant(parent, 'input:checked');
};

export {
  set,
  find,
};