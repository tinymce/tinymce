import { Arr, Fun } from '@ephox/katamari';
import { Awareness, Element, Selection, Traverse, WindowSelection } from '@ephox/sugar';

const COLLAPSED_WIDTH = 2;

const collapsedRect = function (rect) {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: Fun.constant(COLLAPSED_WIDTH),
    height: rect.height
  };
};

const toRect = function (rawRect) {
  return {
    left: Fun.constant(rawRect.left),
    top: Fun.constant(rawRect.top),
    right: Fun.constant(rawRect.right),
    bottom: Fun.constant(rawRect.bottom),
    width: Fun.constant(rawRect.width),
    height: Fun.constant(rawRect.height)
  };
};

const getRectsFromRange = function (range) {
  if (! range.collapsed) {
    return Arr.map(range.getClientRects(), toRect);
  } else {
    const start = Element.fromDom(range.startContainer);
    return Traverse.parent(start).bind(function (parent) {
      const selection = Selection.exact(start, range.startOffset, parent, Awareness.getEnd(parent));
      const optRect = WindowSelection.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
      return optRect.map(collapsedRect).map(Arr.pure);
    }).getOr([ ]);
  }
};

const getRectangles = function (cWin) {
  const sel = cWin.getSelection();
  // In the Android WebView for some reason cWin.getSelection returns undefined.
  // The undefined check it is to avoid throwing of a JS error.
  return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [ ];
};

export default {
  getRectangles
};