/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Awareness, RawRect, SimSelection, SugarElement, Traverse, WindowSelection } from '@ephox/sugar';

const COLLAPSED_WIDTH = 2;

const collapsedRect = (rect: RawRect): RawRect => ({
  ...rect,
  width: COLLAPSED_WIDTH
});

const toRect = (rawRect: ClientRect): RawRect => ({
  left: rawRect.left,
  top: rawRect.top,
  right: rawRect.right,
  bottom: rawRect.bottom,
  width: rawRect.width,
  height: rawRect.height
});

const getRectsFromRange = (range: Range): RawRect[] => {
  if (!range.collapsed) {
    return Arr.map(range.getClientRects(), toRect);
  } else {
    const start = SugarElement.fromDom(range.startContainer);
    return Traverse.parent(start).bind((parent) => {
      const selection = SimSelection.exact(start, range.startOffset, parent, Awareness.getEnd(parent));
      const optRect = WindowSelection.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
      return optRect.map(collapsedRect).map(Arr.pure);
    }).getOr([ ]);
  }
};

const getRectangles = (cWin: Window): RawRect[] => {
  const sel = cWin.getSelection();
  // In the Android WebView for some reason cWin.getSelection returns undefined.
  // The undefined check it is to avoid throwing of a JS error.
  return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [ ];
};

export {
  getRectangles
};
