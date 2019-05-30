import { Arr } from '@ephox/katamari';
import * as Attr from './Attr';
import Element from '../node/Element';

// Methods for handling attributes that contain a list of values <div foo="alpha beta theta">
const read = function (element: Element, attr) {
  const value: string = Attr.get(element, attr);
  return value === undefined || value === '' ? [] : value.split(' ');
};

const add = function (element: Element, attr, id) {
  const old = read(element, attr);
  const nu = old.concat([id]);
  Attr.set(element, attr, nu.join(' '));
  return true;
};

const remove = function (element: Element, attr, id) {
  const nu = Arr.filter(read(element, attr), function (v) {
    return v !== id;
  });
  if (nu.length > 0) { Attr.set(element, attr, nu.join(' ')); } else { Attr.remove(element, attr); }
  return false;
};

export {
  read,
  add,
  remove,
};