import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';

const get = (element: Element<DomNode>): string | null =>
  element.dom().textContent;

const set = (element: Element<DomNode>, value: string): void => {
  element.dom().textContent = value;
};

export {
  get,
  set
};
