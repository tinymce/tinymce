import * as Class from './Class';
import * as Classes from './Classes';
import Element from '../node/Element';
import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';

const addClass = function (clazz: string) {
 return function (element: Element<DomElement>) {
   Class.add(element, clazz);
 };
};

const removeClass = function (clazz: string) {
  return function (element: Element<DomElement>) {
    Class.remove(element, clazz);
  };
};

const removeClasses = function (classes: string[]) {
  return function (element: Element<DomElement>) {
    Classes.remove(element, classes);
  };
};

const hasClass = function (clazz: string) {
  return function (element: Element<DomNode>) {
    return Class.has(element, clazz);
  };
};

export {
  addClass,
  removeClass,
  removeClasses,
  hasClass,
};