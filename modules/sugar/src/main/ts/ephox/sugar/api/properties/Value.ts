import Element from '../node/Element';
import { HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement } from '@ephox/dom-globals';

const get = function (element: Element<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  return element.dom().value;
};

const set = function (element: Element<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, value: string) {
  if (value === undefined) {
    throw new Error('Value.set was undefined');
  }
  element.dom().value = value;
};

export {
  set,
  get,
};