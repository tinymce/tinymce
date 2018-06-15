import { Arr } from '@ephox/katamari';
import Class from './Class';
import ClassList from '../../impl/ClassList';
import Element from '../node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 */
var add = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.add(element, x);
  });
};

var remove = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.remove(element, x);
  });
};

var toggle = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.toggle(element, x);
  });
};

var hasAll = function (element: Element, classes: string[]) {
  return Arr.forall(classes, function (clazz) {
    return Class.has(element, clazz);
  });
};

var hasAny = function (element: Element, classes: string[]) {
  return Arr.exists(classes, function (clazz) {
    return Class.has(element, clazz);
  });
};

var getNative = function (element: Element) {
  var classList = (element.dom() as DomElement).classList;
  var r: string[] = new Array(classList.length);
  for (var i = 0; i < classList.length; i++) {
    r[i] = classList.item(i);
  }
  return r;
};

var get = function (element: Element) {
  return ClassList.supports(element) ? getNative(element) : ClassList.get(element);
};

export default {
  add,
  remove,
  toggle,
  hasAll,
  hasAny,
  get,
};