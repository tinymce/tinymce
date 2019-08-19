import Element from '../node/Element';
import { HTMLInputElement, HTMLTextAreaElement } from '@ephox/dom-globals';

const get = function (element: Element<HTMLInputElement | HTMLTextAreaElement>) {
  return element.dom().value;
};

const set = function (element: Element<HTMLInputElement | HTMLTextAreaElement>, value: string) {
  if (value === undefined) {
    throw new Error('Value.set was undefined');
  }
  element.dom().value = value;
};

export {
  set,
  get,
};