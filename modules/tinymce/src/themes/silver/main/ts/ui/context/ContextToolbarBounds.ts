/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bounds, Boxes } from '@ephox/alloy';
import { Element, SelectorFind, VisualViewport } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { window } from '@ephox/dom-globals';
import * as Settings from '../../api/Settings';

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

  const vpHeight = viewportBounds.height();
  const vpTop = viewportBounds.y();

  // Fixed toolbar container allows the toolbar to be above or below
  // so we need to constrain the overflow based on that
  if (headerBox.y() >= contentAreaBox.bottom()) {
    // Toolbar is below, so allow overflowing the top
    const bottom = Math.min(vpHeight + vpTop, headerBox.y());
    const height = bottom - vpTop;
    return Boxes.bounds(x, vpTop, width, height);
  } else {
    // Toolbar is above, so allow overflowing the bottom
    const y = Math.max(vpTop, headerBox.bottom());
    const height = vpHeight - (y - vpTop);
    return Boxes.bounds(x, y, width, height);
  }
};

// Allow the toolbar to overflow both top/bottom when no toolbar/menubar
const getDistractionFreeBounds = (_editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds): Bounds => {
  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);
  return Boxes.bounds(x, viewportBounds.y(), width, viewportBounds.height());
};

const getContextToolbarBounds = (editor: Editor) => {
  const toolbarOrMenubarEnabled = Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);
  const viewportBounds = VisualViewport.getBounds(window);
  const contentAreaBox = Boxes.box(Element.fromDom(editor.getContentAreaContainer()));

  // Create a bounds that lets the context toolbar overflow outside the content area, but remains in the viewport
  if (editor.inline && !toolbarOrMenubarEnabled) {
    return getDistractionFreeBounds(editor, contentAreaBox, viewportBounds);
  } else if (editor.inline) {
    return getInlineBounds(editor, contentAreaBox, viewportBounds);
  } else {
    return getIframeBounds(editor, contentAreaBox, viewportBounds);
  }
};

export {
  getContextToolbarBounds
};
