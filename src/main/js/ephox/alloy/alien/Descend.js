define(
  'ephox.alloy.alien.Descend',

  [
    'ephox.oath.proximity.Awareness',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (Awareness, Struct, Attr, Node, Text, Traverse) {
    var point = Struct.immutable('element', 'offset');
    
    var descend = function (element, offset) {
      var children = Traverse.children(element);
      if (children.length === 0) return point(element, offset);
      else if (offset < children.length) return point(children[offset], 0);
      else {
        var last = children[children.length - 1];
        var len = Node.isText(last) ? Text.get(last).length : Traverse.children(last).length;
        return point(last, len);
      }
    };

    var isLeaf = function (element) {
      return Attr.get(element, 'contenteditable') === 'false';
    };

    var getLast = function (children) {
      // requires a non-empty array of children
      var last = children[children.length - 1];
      var offset = Awareness.getEnd(last);
      return point(last, offset);
    };

    var descendUntilLeaf = function (original, originalOffset) {
      var fallback = point(original, originalOffset);
      var down = function (spot) {
        return isLeaf(spot.element()) ? fallback : Traverse.child(spot.element(), spot.offset()).fold(function () {
          return spot;
        }, function (child) {
          return down(point(child, 0));
        });
      };

      var children = Traverse.children(original);
      if (children.length > 0 && originalOffset < children.length) return down(point(children[originalOffset], 0));
      else if (children.length > 0 && originalOffset === children.length) return down(getLast(children));
      else return fallback;
    };

    return {
      point: point,
      descend: descend,
      descendUntilLeaf: descendUntilLeaf
    };
  }
);
