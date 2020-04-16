import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';

// REQUIRES IE9
const get = (element: Element<DomNode>) => element.dom().textContent;

const set = (element: Element<DomNode>, value: string) => element.dom().textContent = value;

export {
  get,
  set
};
