define(
  'ephox.alloy.alien.ElementFromPoint',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.Traverse',
    'global!document'
  ],

  function (Option, Element, Node, Traverse, document) {
    // Note, elementFromPoint gives a different answer than caretRangeFromPoint
    var elementFromPoint = function (doc, x, y) {
      return Option.from(
        doc.dom().elementFromPoint(x, y)
      ).map(Element.fromDom);
    };

    var insideComponent = function (component, x, y) {
      var isInside = function (node) {
        return component.element().dom().contains(node.dom());
      };

      var hasValidRect = function (node) {
        var elem = Node.isText(node) ? Traverse.parent(node) : Option.some(node);
        return elem.exists(function (e) {
          var rect = e.dom().getBoundingClientRect();
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
      };

      var doc = Traverse.owner(component.element());
      return elementFromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
    };

    return {
      insideComponent: insideComponent
    };
  }
);
