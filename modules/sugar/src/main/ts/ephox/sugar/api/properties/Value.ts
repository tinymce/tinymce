import Element from '../node/Element';
import { HTMLInputElement } from '@ephox/dom-globals';

const get = function (element: Element) {
  return (element.dom() as HTMLInputElement).value;
};

const set = function (element: Element, value: string) {
  if (value === undefined) { throw new Error('Value.set was undefined'); }
  (element.dom() as HTMLInputElement).value = value;
};

export {
  set,
  get,
};