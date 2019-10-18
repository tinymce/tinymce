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

const getHorizontalBounds = (contentAreaBox: Bounds, viewportBounds: Bounds): { x: number, width: number } => {
  const x = Math.max(viewportBounds.x(), contentAreaBox.x());
  const contentBoxWidth = contentAreaBox.right() - x;
  const maxViewportWidth = viewportBounds.width() - (x - viewportBounds.x());
  const width = Math.min(contentBoxWidth, maxViewportWidth);
  return { x, width };
};

const getVerticalBounds = (editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds): { y: number, height: number } => {
  const container = Element.fromDom(editor.getContainer());

  const header = SelectorFind.descendant(container, '.tox-editor-header').getOr(container);
  const headerBox = Boxes.box(header);
  const isToolbarBelowContentArea = headerBox.y() >= contentAreaBox.bottom();
  const isToolbarLocationTop = Settings.isToolbarLocationTop(editor);
  const isToolbarAbove = isToolbarLocationTop && !isToolbarBelowContentArea;

  // Ignoring the header, inline allows for positioning within the whole viewport and Iframe only within the container
  const primaryBounds = editor.inline ? viewportBounds : Boxes.box(container);

  const upperBound = isToolbarAbove ?
    Math.max(headerBox.bottom(), viewportBounds.y()) :
    Math.max(primaryBounds.y(), viewportBounds.y());

  const lowerBound = isToolbarAbove ?
    Math.min(primaryBounds.bottom(), viewportBounds.bottom()) :
    Math.min(headerBox.y(), viewportBounds.bottom());

  return {
    y: upperBound,
    height: lowerBound - upperBound
  };
};

const getContextToolbarBounds = (editor: Editor) => {
  const viewportBounds = VisualViewport.getBounds(window);
  const contentAreaBox = Boxes.box(Element.fromDom(editor.getContentAreaContainer()));
  const toolbarOrMenubarEnabled = Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);

  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);

  // Create bounds that lets the context toolbar overflow outside the content area, but remains in the viewport
  if (editor.inline && !toolbarOrMenubarEnabled) {
    return Boxes.bounds(x, viewportBounds.y(), width, viewportBounds.height());
  } else {
    const { y, height } = getVerticalBounds(editor, contentAreaBox, viewportBounds);
    return Boxes.bounds(x, y, width, height);
  }
};

export {
  getContextToolbarBounds
};
