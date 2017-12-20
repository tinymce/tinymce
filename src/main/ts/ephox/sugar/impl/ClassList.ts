import { Arr } from '@ephox/katamari';
import AttrList from '../api/properties/AttrList';

var supports = function (element) {
  // IE11 Can return undefined for a classList on elements such as math, so we make sure it's not undefined before attempting to use it.
  return element.dom().classList !== undefined;
};

var get = function (element) {
  return AttrList.read(element, 'class');
};

var add = function (element, clazz) {
  return AttrList.add(element, 'class', clazz);
};

var remove = function (element, clazz) {
  return AttrList.remove(element, 'class', clazz);
};

var toggle = function (element, clazz) {
  if (Arr.contains(get(element), clazz)) {
    remove(element, clazz);
  } else {
    add(element, clazz);
  }
};

export default <any> {
  get: get,
  add: add,
  remove: remove,
  toggle: toggle,
  supports: supports
};