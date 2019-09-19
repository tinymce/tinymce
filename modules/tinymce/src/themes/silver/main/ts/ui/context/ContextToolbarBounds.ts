/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bounds, Boxes } from '@ephox/alloy';
import { Element, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getHorizontalBounds = (contentAreaBox: Bounds, viewportBounds: Bounds) => {
  const x = Math.max(viewportBounds.x(), contentAreaBox.x());
  const contentBoxWidth = contentAreaBox.right() - x;
  const maxViewportWidth = viewportBounds.width() - (x - viewportBounds.x());
  const width = Math.min(contentBoxWidth, maxViewportWidth);
  return { x, width };
};

// Allow the toolbar to overflow over the statusbar only
const getIframeBounds = (editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);
  const container = Element.fromDom(editor.getContainer());
  const header = SelectorFind.descendant(container, '.tox-editor-header').getOr(container);
  const containerBox = Boxes.box(container);
  const headerBox = Boxes.box(header);

  const y = Math.max(viewportBounds.y(), contentAreaBox.y(), headerBox.bottom());
  // Use the container here, so that the statusbar is included
  const contentBoxHeight = containerBox.bottom() - y;
  const maxViewportHeight = viewportBounds.height() - (y - viewportBounds.y());
  const height = Math.min(contentBoxHeight, maxViewportHeight);

  return Boxes.bounds(x, y, width, height);
};

// Allow the toolbar to overflow over the bottom when a toolbar/menubar is visible
const getInlineBounds = (editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);
  const container = Element.fromDom(editor.getContainer());
  const header = SelectorFind.descendant(container, '.tox-editor-header').getOr(container);
  const headerBox = Boxes.box(header);

  // Fixed toolbar container allows the toolbar to be above or below
  // so we need to constrain the overflow based on that
  if (headerBox.y() >= contentAreaBox.bottom()) {
    // Toolbar is below, so allow overflowing the top
    const bottom = Math.min(viewportBounds.height() + viewportBounds.y(), headerBox.y());
    const height = bottom - viewportBounds.y();
    return Boxes.bounds(x, viewportBounds.y(), width, height);
  } else {
    // Toolbar is above, so allow overflowing the bottom
    const y = Math.max(viewportBounds.y(), headerBox.bottom());
    const height = viewportBounds.height() - (y - viewportBounds.y());
    return Boxes.bounds(x, y, width, height);
  }
};

// Allow the toolbar to overflow both top/bottom when no toolbar/menubar
const getDistractionFreeBounds = (_editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);
  return Boxes.bounds(x, viewportBounds.y(), width, viewportBounds.height());
};

export {
  getDistractionFreeBounds,
  getIframeBounds,
  getInlineBounds
};
