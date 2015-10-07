define(
  'ephox.phoenix.wrap.Navigation',

  [
    'ephox.bud.Unicode',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot'
  ],

  function (Unicode, Option, Spot) {
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

    var scan = function (universe, element, direction) {
      if (! universe.property().isText(element)) return Option.none();
      var text = universe.property().getText(element);
      if (Unicode.trimNative(text).length > 0) return Option.none();
      return direction(element).bind(function (elem) {
        return scan(universe, elem, direction).orThunk(function () {
          return Option.some(elem);
        });
      });
    };

    var freefallLtr = function (universe, element, shortcuts) {
      var candidate = scan(universe, element, universe.query().nextSibling).getOr(element);
      console.log('candidate', candidate.dom());
      if (universe.property().isText(candidate)) return Spot.point(candidate, 0);
      var children = universe.property().children(candidate);
      return children.length > 0 ? freefallLtr(universe, children[0], shortcuts) : Spot.point(candidate, 0);
    };

    var toEnd = function (universe, element) {
      if (universe.property().isText(element)) return universe.property().getText(element).length;
      var children = universe.property().children(element);
      return children.length;
    };

    var freefallRtl = function (universe, element, shortcuts) {
      var candidate = scan(universe, element, universe.query().prevSibling).getOr(element);
      if (universe.property().isText(candidate)) return Spot.point(candidate, toEnd(universe, candidate));
      var children = universe.property().children(candidate);
      return children.length > 0 ? freefallRtl(universe, children[children.length - 1], shortcuts) : Spot.point(candidate, toEnd(universe, candidate));
    };

    return {
      toLast: toLast,
      toLeaf: toLeaf,
      toLower: toLower,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);
