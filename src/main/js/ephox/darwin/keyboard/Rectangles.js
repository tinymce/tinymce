define(
  'ephox.darwin.keyboard.Rectangles',

  [
    'ephox.darwin.keyboard.Carets',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Node'
  ],

  function (Carets, Awareness, Option, Node) {
    var getPartialBox = function (bridge, element, offset) {
      if (offset >= 0 && offset < Awareness.getEnd(element)) return bridge.getRangedRect(element, offset, element, offset+1);
      else if (offset > 0) return bridge.getRangedRect(element, offset - 1, element, offset);
      return Option.none();
    };

    var toCaret = function (rect) {
      return Carets.nu({
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      });
    };

    var getElemBox = function (bridge, element, offset) {
      return Option.some(bridge.getRect(element));
    };

    var getBoxAt = function (bridge, element, offset) {
      // Note, we might need to consider this offset and descend.
      if (Node.isElement(element)) return getElemBox(bridge, element, offset).map(toCaret);
      else if (Node.isText(element)) return getPartialBox(bridge, element, offset).map(toCaret);
      else return Option.none();
    };

    var getEntireBox = function (bridge, element, offset) {
      if (Node.isElement(element)) return getElemBox(bridge, element, offset).map(toCaret);
      else if (Node.isText(element)) return bridge.getRangedRect(element, 0, element, Awareness.getEnd(element)).map(toCaret);
      else return Option.none();
    };

    return {
      getBoxAt: getBoxAt,
      getEntireBox: getEntireBox
    };
  }
);