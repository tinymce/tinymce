define(
  'ephox.sugar.api.dom.Remove',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, InsertAll, Traverse) {
    var empty = function (element) {
      // shortcut "empty node" trick. Requires IE 9.
      element.dom().textContent = '';

      // If the contents was a single empty text node, the above doesn't remove it. But, it's still faster in general
      // than removing every child node manually.
      // The following is (probably) safe for performance as 99.9% of the time the trick works and
      // Traverse.children will return an empty array.
      Arr.each(Traverse.children(element), function (rogue) {
        remove(rogue);
      });
    };

    var remove = function (element) {
      var dom = element.dom();
      if (dom.parentNode !== null)
        dom.parentNode.removeChild(dom);
    };

    var unwrap = function (wrapper) {
      var children = Traverse.children(wrapper);
      if (children.length > 0)
        InsertAll.before(wrapper, children);
      remove(wrapper);
    };

    return {
      empty: empty,
      remove: remove,
      unwrap: unwrap
    };
  }
);
