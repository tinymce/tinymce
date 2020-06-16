import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Element from '../api/node/Element';
import * as AttrList from '../api/properties/AttrList';

// IE11 Can return undefined for a classList on elements such as math, so we make sure it's not undefined before attempting to use it.
const supports = (element: Element<DomNode>): element is Element<DomElement> => (element.dom() as DomElement).classList !== undefined;

const get = (element: Element<DomElement>) => AttrList.read(element, 'class');

const add = (element: Element<DomElement>, clazz: string) => AttrList.add(element, 'class', clazz);

const remove = (element: Element<DomElement>, clazz: string) => AttrList.remove(element, 'class', clazz);

const toggle = (element: Element<DomElement>, clazz: string) => {
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
  supports
};
