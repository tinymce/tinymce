define(
  'ephox.sugar.api.dom.Dom',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'global!document'
  ],

  function (Fun, Compare, Element, Node, PredicateFind, document) {
    // TEST: Is this just Body.inBody which doesn't need scope ??
    var attached = function (element, scope) {
      var doc = scope || Element.fromDom(document.documentElement);
      return PredicateFind.ancestor(element, Fun.curry(Compare.eq, doc)).isSome();
    };

    // TEST: Is this just Traverse.defaultView ??
    var windowOf = function (element) {
      var dom = element.dom();
      if (dom === dom.window) return element;
      return Node.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
    };

    return {
      attached: attached,
      windowOf: windowOf
    };
  }
);
