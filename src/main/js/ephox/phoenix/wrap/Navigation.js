define(
  'ephox.phoenix.wrap.Navigation',

  [
    'ephox.phoenix.api.data.Spot'
  ],

  function (Spot) {
    /**
     * Return the last available cursor position in the node.
     */
    var toLast = function (universe, node) {
      if (universe.property().isText(node)) {
        return Spot.point(node, universe.property().getText(node).length);
      } else {
        var children = universe.property().children(node);
        // keep descending if there are children.
        return children.length > 0 ? toLast(universe, children[children.length - 1]) : Spot.point(node, children.length);
      }
    };

    var toLower = function (universe, node) {
      var lastOffset = universe.property().isText(node) ?
        universe.property().getText(node).length :
        universe.property().children(node).length;
      return Spot.point(node, lastOffset);
    };

    /**
     * Descend down to a leaf node at the given offset.
     */
    var toLeaf = function (universe, element, offset) {
      var children = universe.property().children(element);
      if (children.length > 0 && offset < children.length) {
        return toLeaf(universe, children[offset], 0);
      } else if (children.length > 0 && universe.property().isElement(element) && children.length === offset) {
        return toLast(universe, children[children.length - 1]);
      } else {
        return Spot.point(element, offset);
      }
    };

    return {
      toLast: toLast,
      toLeaf: toLeaf,
      toLower: toLower
    };
  }
);
