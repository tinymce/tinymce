import { Element as DomElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Element from '../node/Element';
import * as Attr from './Attr';

// Methods for handling attributes that contain a list of values <div foo="alpha beta theta">
const read = (element: Element<DomElement>, attr: string): string[] => {
  const value = Attr.get(element, attr);
  return value === undefined || value === '' ? [] : value.split(' ');
};

const add = (element: Element<DomElement>, attr: string, id: string): boolean => {
  const old = read(element, attr);
  const nu = old.concat([ id ]);
  Attr.set(element, attr, nu.join(' '));
  return true;
};

const remove = (element: Element<DomElement>, attr: string, id: string): boolean => {
  const nu = Arr.filter(read(element, attr), (v) => v !== id);
  if (nu.length > 0) {
    Attr.set(element, attr, nu.join(' '));
  } else {
    Attr.remove(element, attr);
  }
  return false;
};

export {
  read,
  add,
  remove
};
