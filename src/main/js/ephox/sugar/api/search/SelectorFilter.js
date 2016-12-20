define(
  'ephox.sugar.api.search.SelectorFilter',

  [
    'ephox.sugar.api.search.PredicateFilter',
    'ephox.sugar.api.search.Selectors'
  ],

  function (PredicateFilter, Selectors) {
    var all = function (selector) {
      return Selectors.all(selector);
    };

    // For all of the following:
    //
    // jQuery does siblings of firstChild. IE9+ supports scope.dom().children (similar to Traverse.children but elements only).
    // Traverse should also do this (but probably not by default).
    //

    var ancestors = function (scope, selector, isRoot) {
      // It may surprise you to learn this is exactly what JQuery does
      // TODO: Avoid all this wrapping and unwrapping
      return PredicateFilter.ancestors(scope, function (e) {
        return Selectors.is(e, selector);
      }, isRoot);
    };

    var siblings = function (scope, selector) {
      // It may surprise you to learn this is exactly what JQuery does
      // TODO: Avoid all the wrapping and unwrapping
      return PredicateFilter.siblings(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var children = function (scope, selector) {
      // It may surprise you to learn this is exactly what JQuery does
      // TODO: Avoid all the wrapping and unwrapping
      return PredicateFilter.children(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var descendants = function (scope, selector) {
      return Selectors.all(selector, scope);
    };

    return {
      all: all,
      ancestors: ancestors,
      siblings: siblings,
      children: children,
      descendants: descendants
    };
  }
);
