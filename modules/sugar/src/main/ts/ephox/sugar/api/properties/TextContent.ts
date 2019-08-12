import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

// REQUIRES IE9
const get = function (element: Element<DomNode>) {
  return element.dom().textContent;
};

const set = function (element: Element<DomNode>, value: string) {
  element.dom().textContent = value;
};

export {
  get,
  set,
};