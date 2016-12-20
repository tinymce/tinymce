define(
  'ephox.agar.alien.SizzleFind',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'ephox.wrap-sizzle.Sizzle'
  ],

  function (Arr, Option, Element, Traverse, Sizzle) {
    var toOptionEl = function (output) {
      return output.length === 0 ? Option.none() : Option.from(output[0]).map(Element.fromDom);
    };

    /* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
    var descendant = function (sugarElement, selector) {
      var siz = Sizzle(selector, sugarElement.dom());
      return toOptionEl(siz);
    };

    /* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
    var descendants = function (sugarElement, selector) {
      return Sizzle(selector, sugarElement.dom());
    };

    var matches = function (sugarElement, selector) {
      return Sizzle.matchesSelector(sugarElement.dom(), selector);
    };

    var child = function (sugarElement, selector) {
      var children = Traverse.children(sugarElement);
      return Arr.find(children, function (child) {
        return matches(child, selector);
      });
    };

    var children = function (sugarElement, selector) {
      var children = Traverse.children(sugarElement);
      return Arr.filter(children, function (child) {
        return matches(child, selector);
      });
    };

    return {
      descendant: descendant,
      descendants: descendants,
      matches: matches,
      child: child,
      children: children
    };
  }
);