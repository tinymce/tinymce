import { Arr } from '@ephox/katamari';
import * as Class from './Class';
import * as ClassList from '../../impl/ClassList';
import Element from '../node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 */
const add = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.add(element, x);
  });
};

const remove = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.remove(element, x);
  });
};

const toggle = function (element: Element, classes: string[]) {
  Arr.each(classes, function (x) {
    Class.toggle(element, x);
  });
};

const hasAll = function (element: Element, classes: string[]) {
  return Arr.forall(classes, function (clazz) {
    return Class.has(element, clazz);
  });
};

const hasAny = function (element: Element, classes: string[]) {
  return Arr.exists(classes, function (clazz) {
    return Class.has(element, clazz);
  });
};

const getNative = function (element: Element) {
  const classList = (element.dom() as DomElement).classList;
  const r: string[] = new Array(classList.length);
  for (let i = 0; i < classList.length; i++) {
    r[i] = classList.item(i);
  }
  return r;
};

const get = function (element: Element) {
  return ClassList.supports(element) ? getNative(element) : ClassList.get(element);
};

export {
  add,
  remove,
  toggle,
  hasAll,
  hasAny,
  get,
};