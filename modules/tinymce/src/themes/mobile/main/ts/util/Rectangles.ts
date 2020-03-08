/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { Awareness, Element, RawRect, Selection, StructRect, Traverse, WindowSelection } from '@ephox/sugar';
import { Range, Window } from '@ephox/dom-globals';

const COLLAPSED_WIDTH = 2;

const collapsedRect = (rect: StructRect): StructRect => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom,
  width: Fun.constant(COLLAPSED_WIDTH),
  height: rect.height
});

const toRect = (rawRect: RawRect): StructRect => ({
  left: Fun.constant(rawRect.left),
  top: Fun.constant(rawRect.top),
  right: Fun.constant(rawRect.right),
  bottom: Fun.constant(rawRect.bottom),
  width: Fun.constant(rawRect.width),
  height: Fun.constant(rawRect.height)
});

const getRectsFromRange = (range: Range): StructRect[] => {
  if (! range.collapsed) {
    return Arr.map(range.getClientRects(), toRect);
  } else {
    const start = Element.fromDom(range.startContainer);
    return Traverse.parent(start).bind((parent) => {
      const selection = Selection.exact(start, range.startOffset, parent, Awareness.getEnd(parent));
      const optRect = WindowSelection.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
      return optRect.map(collapsedRect).map(Arr.pure);
    }).getOr([ ]);
  }
};

const getRectangles = (cWin: Window): StructRect[] => {
  const sel = cWin.getSelection();
  // In the Android WebView for some reason cWin.getSelection returns undefined.
  // The undefined check it is to avoid throwing of a JS error.
  return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [ ];
};

export {
  getRectangles
};
