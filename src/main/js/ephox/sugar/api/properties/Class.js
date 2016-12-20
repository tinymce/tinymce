define(
  'ephox.sugar.api.properties.Class',

  [
    'ephox.sugar.api.properties.Toggler',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.impl.ClassList'
  ],

  function (Toggler, Attr, ClassList) {
    /*
     * ClassList is IE10 minimum:
     * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
     *
     * Note that IE doesn't support the second argument to toggle (at all).
     * If it did, the toggler could be better.
     */

    var add = function (element, clazz) {
      if (ClassList.supports(element)) element.dom().classList.add(clazz);
      else ClassList.add(element, clazz);
    };

    var cleanClass = function (element) {
      var classList = ClassList.supports(element) ? element.dom().classList : ClassList.get(element);
      // classList is a "live list", so this is up to date already
      if (classList.length === 0) {
        // No more classes left, remove the class attribute as well
        Attr.remove(element, 'class');
      }
    };

    var remove = function (element, clazz) {
      if (ClassList.supports(element)) {
        var classList = element.dom().classList;
        classList.remove(clazz);
      } else
        ClassList.remove(element, clazz);

      cleanClass(element);
    };

    var toggle = function (element, clazz) {
      return ClassList.supports(element) ? element.dom().classList.toggle(clazz) :
                                           ClassList.toggle(element, clazz);
    };

    var toggler = function (element, clazz) {
      var hasClasslist = ClassList.supports(element);
      var classList = element.dom().classList;
      var off = function () {
        if (hasClasslist) classList.remove(clazz);
        else ClassList.remove(element, clazz);
      };
      var on = function () {
        if (hasClasslist) classList.add(clazz);
        else ClassList.add(element, clazz);
      };
      return Toggler(off, on, has(element, clazz));
    };

    var has = function (element, clazz) {
      // Cereal has a nasty habit of calling this with a text node >.<
      return ClassList.supports(element) && element.dom().classList.contains(clazz);
    };

    // set deleted, risks bad performance. Be deterministic.

    return {
      add: add,
      remove: remove,
      toggle: toggle,
      toggler: toggler,
      has: has
    };
  }
);
