/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bounds, Boxes } from '@ephox/alloy';
import { window } from '@ephox/dom-globals';
import { Element, Position } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getHorizontalBounds = (editor: Editor, scroll: Position, contentAreaBox: Bounds) => {
  const x = Math.max(scroll.left(), contentAreaBox.x());
  const contentBoxWidth = contentAreaBox.right() - x;
  const maxViewportWidth = window.innerWidth - (x - scroll.left());
  const width = Math.min(contentBoxWidth, maxViewportWidth);
  return { x, width };
};

// Allow the toolbar to overflow over the statusbar only
const getIframeBounds = (editor: Editor, scroll: Position, contentAreaBox: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(editor, scroll, contentAreaBox);
  const containerBox = Boxes.box(Element.fromDom(editor.getContainer()));

  const y = Math.max(scroll.top(), contentAreaBox.y());
  // Use the container here, so that the statusbar is included
  const contentBoxHeight = containerBox.bottom() - y;
  const maxViewportHeight = window.innerHeight - (y - scroll.top());
  const height = Math.min(contentBoxHeight, maxViewportHeight);

  return Boxes.bounds(x, y, width, height);
};

// Allow the toolbar to overflow over the bottom when a toolbar/menubar is visible
const getInlineBounds = (editor: Editor, scroll: Position, contentAreaBox: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(editor, scroll, contentAreaBox);
  const containerBox = Boxes.box(Element.fromDom(editor.getContainer()));
  const windowHeight = window.innerHeight;
  const scrollTop = scroll.top();

  // Fixed toolbar container allows the toolbar to be above or below
  // so we need to constrain the overflow based on that
  if (containerBox.y() >= contentAreaBox.bottom()) {
    // Toolbar is below, so allow overflowing the top
    const bottom = Math.min(windowHeight + scrollTop, containerBox.y());
    const height = bottom - scrollTop;
    return Boxes.bounds(x, scrollTop, width, height);
  } else {
    // Toolbar is above, so allow overflowing the bottom
    const y = Math.max(scrollTop, containerBox.bottom());
    const height = windowHeight - (y - scrollTop);
    return Boxes.bounds(x, y, width, height);
  }
};

// Allow the toolbar to overflow both top/bottom when no toolbar/menubar
const getDistractionFreeBounds = (editor: Editor, scroll: Position, contentAreaBox: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(editor, scroll, contentAreaBox);
  return Boxes.bounds(x, scroll.top(), width, window.innerHeight);
};

export {
  getDistractionFreeBounds,
  getIframeBounds,
  getInlineBounds
};
