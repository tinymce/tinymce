define(
  'ephox.sugar.api.properties.OnNode',

  [
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes'
  ],

  function (Class, Classes) {
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

    return {
      addClass: addClass,
      removeClass: removeClass,
      removeClasses: removeClasses,
      hasClass: hasClass
    };
  }
);