define(
  'ephox.darwin.keyboard.Rectangles',

  [
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (WindowSelection, Awareness, Option, Node, Traverse) {
    var getPartialBox = function (win, element, offset) {
      if (offset >= 0 && offset < Awareness.getEnd(element)) return WindowSelection.rectangleAt(win, element, offset, element, offset + 1);
      else if (offset > 0) return WindowSelection.rectangleAt(win, element, offset - 1, element, offset);
      return Option.none();
    };

    var getElemBox = function (win, element, offset) {
      return Traverse.child(element, offset).fold(function () {
        return Option.some(element.dom().getBoundingClientRect());
      }, function (child) {
        if (Node.name(child) === 'br') return getPartialBox(win, element, offset);
        else return Option.some(child.dom().getBoundingClientRect());
      });
    };

    var getBox = function (win, element, offset) {
      if (Node.isElement(element)) return getElemBox(win, element, offset);
      else if (Node.isText(element)) return getPartialBox(win, element, offset);
      else return Option.none();
    };

    var getSelectionBox = function (win, selection) {
      if (WindowSelection.isCollapsed(selection.start(), selection.soffset(), selection.finish(), selection.foffset())) {
        return getBox(window, selection.start(), selection.soffset());
      } else {
        return WindowSelection.rectangleAt(window, selection.start(), selection.soffset(), selection.finish(), selection.foffset());
      }
    };

    return {
      getBox: getBox,
      getSelectionBox: getSelectionBox
    };
  }
);