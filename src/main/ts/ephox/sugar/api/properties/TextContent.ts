import Element from '../node/Element';
import { Node } from '@ephox/dom-globals';

// REQUIRES IE9
const get = function (element: Element) {
  return (element.dom() as Node).textContent;
};

const set = function (element: Element, value: string) {
  (element.dom() as Node).textContent = value;
};

export {
  get,
  set,
};