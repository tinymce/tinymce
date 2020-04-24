/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bounds, Boxes } from '@ephox/alloy';
import { window } from '@ephox/dom-globals';
import { Element, SelectorFind, VisualViewport } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../../api/Settings';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

const getHorizontalBounds = (contentAreaBox: Bounds, viewportBounds: Bounds): { x: number; width: number } => {
  const x = Math.max(viewportBounds.x, contentAreaBox.x);
  const contentBoxWidth = contentAreaBox.right - x;
  const maxViewportWidth = viewportBounds.width - (x - viewportBounds.x);
  const width = Math.min(contentBoxWidth, maxViewportWidth);
  return { x, width };
};

const getVerticalBounds = (editor: Editor, contentAreaBox: Bounds, viewportBounds: Bounds, isToolbarLocationTop: boolean): { y: number; bottom: number } => {
  const container = Element.fromDom(editor.getContainer());
  const header = SelectorFind.descendant(container, '.tox-editor-header').getOr(container);
  const headerBox = Boxes.box(header);
  const isToolbarBelowContentArea = headerBox.y >= contentAreaBox.bottom;
  const isToolbarAbove = isToolbarLocationTop && !isToolbarBelowContentArea;

  // Scenario toolbar top & inline: Bottom of the header -> Bottom of the viewport
  if (editor.inline && isToolbarAbove) {
    return {
      y: Math.max(headerBox.bottom, viewportBounds.y),
      bottom: viewportBounds.bottom
    };
  }

  // Scenario toolbar top & inline: Top of the viewport -> Top of the header
  if (editor.inline && !isToolbarAbove) {
    return {
      y: viewportBounds.y,
      bottom: Math.min(headerBox.y, viewportBounds.bottom)
    };
  }

  const containerBounds = Boxes.box(container);

  // Scenario toolbar bottom & Iframe: Bottom of the header -> Bottom of the editor container
  if (isToolbarAbove) {
    return {
      y: Math.max(headerBox.bottom, viewportBounds.y),
      bottom: Math.min(containerBounds.bottom, viewportBounds.bottom)
    };
  }

  // Scenario toolbar bottom & Iframe: Top of the editor container -> Top of the header
  return {
    y: Math.max(containerBounds.y, viewportBounds.y),
    bottom: Math.min(headerBox.y, viewportBounds.bottom)
  };
};

const getContextToolbarBounds = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const viewportBounds = VisualViewport.getBounds(window);
  const contentAreaBox = Boxes.box(Element.fromDom(editor.getContentAreaContainer()));
  const toolbarOrMenubarEnabled = Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);

  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds);

  // Create bounds that lets the context toolbar overflow outside the content area, but remains in the viewport
  if (editor.inline && !toolbarOrMenubarEnabled) {
    return Boxes.bounds(x, viewportBounds.y, width, viewportBounds.height);
  } else {
    const isToolbarTop = sharedBackstage.header.isPositionedAtTop();
    const { y, bottom } = getVerticalBounds(editor, contentAreaBox, viewportBounds, isToolbarTop);
    return Boxes.bounds(x, y, width, bottom - y);
  }
};

export {
  getContextToolbarBounds
};
