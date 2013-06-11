define(
  'ephox.phoenix.wrap.Navigation',

  [
    'ephox.phoenix.api.data.Spot'
  ],

  function (Spot) {
    var toLast = function (universe, children) {
      var last = children[children.length - 1];
      var lastOffset = universe.property().isText(last) ?
        universe.property().getText(last).length :
        universe.property().children(last).length;
      return Spot.point(last, lastOffset);
    };

    var toLeaf = function (universe, element, offset) {
      var children = universe.property().children(element);
      if (children.length > 0 && offset < children.length) {
        return toLeaf(universe, children[offset], 0);
      } else if (children.length > 0 && universe.property().isElement(element) && children.length === offset) {
        return toLast(universe, children);
      } else {
        return Spot.point(element, offset);
      }
    };

    return {
      toLast: toLast,
      toLeaf: toLeaf
    };
  }
);
