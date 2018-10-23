import { Arr } from '@ephox/katamari';
import * as AttrList from '../api/properties/AttrList';
import Element from '../api/node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

var supports = function (element: Element) {
  // IE11 Can return undefined for a classList on elements such as math, so we make sure it's not undefined before attempting to use it.
  return (element.dom() as DomElement).classList !== undefined;
};

var get = function (element: Element) {
  return AttrList.read(element, 'class');
};

var add = function (element: Element, clazz: string) {
  return AttrList.add(element, 'class', clazz);
};

var remove = function (element: Element, clazz: string) {
  return AttrList.remove(element, 'class', clazz);
};

var toggle = function (element: Element, clazz: string) {
  if (Arr.contains(get(element), clazz)) {
    return remove(element, clazz);
  } else {
    return add(element, clazz);
  }
};

export {
  get,
  add,
  remove,
  toggle,
  supports,
};