import Class from './Class';
import Classes from './Classes';

var addClass = function (clazz) {
 return function (element) {
   Class.add(element, clazz);
 };
};

var removeClass = function (clazz) {
  return function (element) {
    Class.remove(element, clazz);
  };
};

var removeClasses = function (classes) {
  return function (element) {
    Classes.remove(element, classes);
  };
};

var hasClass = function (clazz) {
  return function (element) {
    return Class.has(element, clazz);
  };
};

export default <any> {
  addClass: addClass,
  removeClass: removeClass,
  removeClasses: removeClasses,
  hasClass: hasClass
};