import * as Class from './Class';
import * as Classes from './Classes';
import Element from '../node/Element';

const addClass = function (clazz: string) {
 return function (element: Element) {
   Class.add(element, clazz);
 };
};

const removeClass = function (clazz: string) {
  return function (element: Element) {
    Class.remove(element, clazz);
  };
};

const removeClasses = function (classes: string[]) {
  return function (element: Element) {
    Classes.remove(element, classes);
  };
};

const hasClass = function (clazz: string) {
  return function (element: Element) {
    return Class.has(element, clazz);
  };
};

export {
  addClass,
  removeClass,
  removeClasses,
  hasClass,
};