define(
  'ephox.sugar.api.search.SelectorExists',

  [
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (SelectorFind) {
    var any = function (selector) {
      return SelectorFind.first(selector).isSome();
    };

    var ancestor = function (scope, selector, isRoot) {
      return SelectorFind.ancestor(scope, selector, isRoot).isSome();
    };

    var sibling = function (scope, selector) {
      return SelectorFind.sibling(scope, selector).isSome();
    };

    var child = function (scope, selector) {
      return SelectorFind.child(scope, selector).isSome();
    };

    var descendant = function (scope, selector) {
      return SelectorFind.descendant(scope, selector).isSome();
    };

    var closest = function (scope, selector, isRoot) {
      return SelectorFind.closest(scope, selector, isRoot).isSome();
    };

    return {
      any: any,
      ancestor: ancestor,
      sibling: sibling,
      child: child,
      descendant: descendant,
      closest: closest
    };
  }
);
