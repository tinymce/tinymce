define(
  'tinymce.themes.mobile.util.Rectangles',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Awareness',
    'ephox.sugar.api.selection.WindowSelection'
  ],

  function (Arr, Element, Traverse, Awareness, WindowSelection) {
    var COLLAPSED_WIDTH = 2;

    var collapsedRect = function (rect) {
      return {
        left: rect.left,
        top: rect.top,
        width: COLLAPSED_WIDTH,
        height: rect.height
      };
    };

    var getRectsFromRange = function (range) {
      if (! range.collapsed) return range.getClientRects();
      else {
        var start = Element.fromDom(range.startContainer);
        return Traverse.parent(start).bind(function (parent) {
          var optRect = WindowSelection.getFirstRect(range.startContainer.ownerDocument.defaultView, start, range.startOffset, parent, Awareness.getEnd(parent));
          debugger;
          return optRect.map(collapsedRect).map(Arr.pure);
        }).getOr([ ]);
      }
    };

    var getRectangles = function (cWin) {
      var sel = cWin.getSelection();
      // In the Android WebView for some reason cWin.getSelection returns undefined.
      // The undefined check it is to avoid throwing of a JS error.
      return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [ ];
    };

    return {
      getRectangles: getRectangles
    };
  }
);
