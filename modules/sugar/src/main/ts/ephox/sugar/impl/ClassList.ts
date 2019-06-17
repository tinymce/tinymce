import { Arr } from '@ephox/katamari';
import * as AttrList from '../api/properties/AttrList';
import Element from '../api/node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

const supports = function (element: Element) {
  // IE11 Can return undefined for a classList on elements such as math, so we make sure it's not undefined before attempting to use it.
  return (element.dom() as DomElement).classList !== undefined;
};

const get = function (element: Element) {
  return AttrList.read(element, 'class');
};

const add = function (element: Element, clazz: string) {
  return AttrList.add(element, 'class', clazz);
};

const remove = function (element: Element, clazz: string) {
  return AttrList.remove(element, 'class', clazz);
};

const toggle = function (element: Element, clazz: string) {
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