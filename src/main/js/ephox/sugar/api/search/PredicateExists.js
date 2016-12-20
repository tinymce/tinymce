define(
  'ephox.sugar.api.search.PredicateExists',

  [
    'ephox.sugar.api.search.PredicateFind'
  ],

  function (PredicateFind) {
    var any = function (predicate) {
      return PredicateFind.first(predicate).isSome();
    };

    var ancestor = function (scope, predicate, isRoot) {
      return PredicateFind.ancestor(scope, predicate, isRoot).isSome();
    };

    var closest = function (scope, predicate, isRoot) {
      return PredicateFind.closest(scope, predicate, isRoot).isSome();
    };

    var sibling = function (scope, predicate) {
      return PredicateFind.sibling(scope, predicate).isSome();
    };

    var child = function (scope, predicate) {
      return PredicateFind.child(scope, predicate).isSome();
    };

    var descendant = function (scope, predicate) {
      return PredicateFind.descendant(scope, predicate).isSome();
    };

    return {
      any: any,
      ancestor: ancestor,
      closest: closest,
      sibling: sibling,
      child: child,
      descendant: descendant
    };
  }
);
