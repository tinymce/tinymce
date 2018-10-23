import * as Class from './Class';
import * as Classes from './Classes';
import Element from '../node/Element';

var addClass = function (clazz: string) {
 return function (element: Element) {
   Class.add(element, clazz);
 };
};

var removeClass = function (clazz: string) {
  return function (element: Element) {
    Class.remove(element, clazz);
  };
};

var removeClasses = function (classes: string[]) {
  return function (element: Element) {
    Classes.remove(element, classes);
  };
};

var hasClass = function (clazz: string) {
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