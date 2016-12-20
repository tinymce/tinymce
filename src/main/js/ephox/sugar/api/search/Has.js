define(
  'ephox.sugar.api.search.Has',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.PredicateExists'
  ],

  function (Arr, Fun, Compare, PredicateExists) {
    var ancestor = function (element, target) {
      return PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));
    };

    var anyAncestor = function (element, targets) {
      return Arr.exists(targets, function (target) {
        return ancestor(element, target);
      });
    };

    var sibling = function (element, target) {
      return PredicateExists.sibling(element, Fun.curry(Compare.eq, target));
    };

    var child = function (element, target) {
      return PredicateExists.child(element, Fun.curry(Compare.eq, target));
    };

    var descendant = function (element, target) {
      return PredicateExists.descendant(element, Fun.curry(Compare.eq, target));
    };

    return {
      ancestor: ancestor,
      anyAncestor: anyAncestor,
      sibling: sibling,
      child: child,
      descendant: descendant
    };
  }
);
