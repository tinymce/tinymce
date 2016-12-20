define(
  'ephox.sugar.api.properties.Classes',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.impl.ClassList',
    'global!Array'
  ],

  function (Arr, Class, ClassList, Array) {
    /*
     * ClassList is IE10 minimum:
     * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
     */
    var add = function (element, classes) {
      Arr.each(classes, function (x) {
        Class.add(element, x);
      });
    };

    var remove = function (element, classes) {
      Arr.each(classes, function (x) {
        Class.remove(element, x);
      });
    };

    var toggle = function (element, classes) {
      Arr.each(classes, function (x) {
        Class.toggle(element, x);
      });
    };

    var hasAll = function (element, classes) {
      return Arr.forall(classes, function (clazz) {
        return Class.has(element, clazz);
      });
    };

    var hasAny = function (element, classes) {
      return Arr.exists(classes, function (clazz) {
        return Class.has(element, clazz);
      });
    };

    var getNative = function (element) {
      var classList = element.dom().classList;
      var r = new Array(classList.length);
      for (var i = 0; i < classList.length; i++) {
        r[i] = classList.item(i);
      }
      return r;
    };

    var get = function (element) {
      return ClassList.supports(element) ? getNative(element) : ClassList.get(element);
    };

    // set deleted, risks bad performance. Be deterministic.

    return {
      add: add,
      remove: remove,
      toggle: toggle,
      hasAll: hasAll,
      hasAny: hasAny,
      get: get
    };
  }
);
