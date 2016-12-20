define(
  'ephox.sugar.api.search.SelectorFind',

  [
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Selectors',
    'ephox.sugar.impl.ClosestOrAncestor'
  ],

  function (PredicateFind, Selectors, ClosestOrAncestor) {
    // TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

    var first = function (selector) {
      return Selectors.one(selector);
    };

    var ancestor = function (scope, selector, isRoot) {
      return PredicateFind.ancestor(scope, function (e) {
        return Selectors.is(e, selector);
      }, isRoot);
    };

    var sibling = function (scope, selector) {
      return PredicateFind.sibling(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var child = function (scope, selector) {
      return PredicateFind.child(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var descendant = function (scope, selector) {
      return Selectors.one(selector, scope);
    };

    var closest = function (scope, selector, isRoot) {
      return ClosestOrAncestor(Selectors.is, ancestor, scope, selector, isRoot);
    };

    return {
      first: first,
      ancestor: ancestor,
      sibling: sibling,
      child: child,
      descendant: descendant,
      closest: closest
    };
  }
);
