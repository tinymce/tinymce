/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bounds, Boxes } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Scroll, SelectorFind, SugarBody, SugarElement, SugarNode, Traverse, WindowVisualViewport } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../../api/Settings';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

// Note: We want to avoid including with small difference such as 0.001px
const isVerticalOverlap = (a: Bounds, b: Bounds, threshold: number = 0.01): boolean =>
  b.bottom - a.y >= threshold && a.bottom - b.y >= threshold;

const getRangeRect = (rng: Range): DOMRect => {
  const rect = rng.getBoundingClientRect();
  // Some ranges (eg <td><br></td>) will return a 0x0 rect, so we'll need to calculate it from the leaf instead
  if (rect.height <= 0 && rect.width <= 0) {
    const leaf = Traverse.leaf(SugarElement.fromDom(rng.startContainer), rng.startOffset).element;
    const elm = SugarNode.isText(leaf) ? Traverse.parent(leaf) : Optional.some(leaf);
    return elm.filter(SugarNode.isElement)
      .map((e) => e.dom.getBoundingClientRect())
      // We have nothing valid, so just fallback to the original rect
      .getOr(rect);
  } else {
    return rect;
  }
};

const getSelectionBounds = (editor: Editor): Bounds => {
  const rng = editor.selection.getRng();
  const rect = getRangeRect(rng);
  if (editor.inline) {
    const scroll = Scroll.get();
    return Boxes.bounds(scroll.left + rect.left, scroll.top + rect.top, rect.width, rect.height);
  } else {
    // Translate to the top level document, as rect is relative to the iframe viewport
    const bodyPos = Boxes.absolute(SugarElement.fromDom(editor.getBody()));
    return Boxes.bounds(bodyPos.x + rect.left, bodyPos.y + rect.top, rect.width, rect.height);
  }
};

const getAnchorElementBounds = (editor: Editor, lastElement: Optional<SugarElement<Element>>): Bounds =>
  lastElement
    .filter(SugarBody.inBody)
    .map(Boxes.absolute)
    .getOrThunk(() => getSelectionBounds(editor));

const getHorizontalBounds = (contentAreaBox: Bounds, viewportBounds: Bounds, margin: number): { x: number; width: number } => {
  const x = Math.max(contentAreaBox.x + margin, viewportBounds.x);
  const right = Math.min(contentAreaBox.right - margin, viewportBounds.right);
  return { x, width: right - x };
};

const getVerticalBounds = (
  editor: Editor,
  contentAreaBox: Bounds,
  viewportBounds: Bounds,
  isToolbarLocationTop: boolean,
  toolbarType: InlineContent.ContextPosition,
  margin: number
): { y: number; bottom: number } => {
  const container = SugarElement.fromDom(editor.getContainer());
  const header = SelectorFind.descendant<HTMLElement>(container, '.tox-editor-header').getOr(container);
  const headerBox = Boxes.box(header);
  const isToolbarBelowContentArea = headerBox.y >= contentAreaBox.bottom;
  const isToolbarAbove = isToolbarLocationTop && !isToolbarBelowContentArea;

  // Scenario toolbar top & inline: Bottom of the header -> Bottom of the viewport
  if (editor.inline && isToolbarAbove) {
    return {
      y: Math.max(headerBox.bottom + margin, viewportBounds.y),
      bottom: viewportBounds.bottom
    };
  }

  // Scenario toolbar top & inline: Top of the viewport -> Top of the header
  if (editor.inline && !isToolbarAbove) {
    return {
      y: viewportBounds.y,
      bottom: Math.min(headerBox.y - margin, viewportBounds.bottom)
    };
  }

  // Allow line based context toolbar to overlap the statusbar
  const containerBounds = toolbarType === 'line' ? Boxes.box(container) : contentAreaBox;

  // Scenario toolbar bottom & Iframe: Bottom of the header -> Bottom of the editor container
  if (isToolbarAbove) {
    return {
      y: Math.max(headerBox.bottom + margin, viewportBounds.y),
      bottom: Math.min(containerBounds.bottom - margin, viewportBounds.bottom)
    };
  }

  // Scenario toolbar bottom & Iframe: Top of the editor container -> Top of the header
  return {
    y: Math.max(containerBounds.y + margin, viewportBounds.y),
    bottom: Math.min(headerBox.y - margin, viewportBounds.bottom)
  };
};

const getContextToolbarBounds = (
  editor: Editor,
  sharedBackstage: UiFactoryBackstageShared,
  toolbarType: InlineContent.ContextPosition,
  margin: number = 0
): Bounds => {
  const viewportBounds = WindowVisualViewport.getBounds(window);
  const contentAreaBox = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
  const toolbarOrMenubarEnabled = Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);

  const { x, width } = getHorizontalBounds(contentAreaBox, viewportBounds, margin);

  // Create bounds that lets the context toolbar overflow outside the content area, but remains in the viewport
  if (editor.inline && !toolbarOrMenubarEnabled) {
    return Boxes.bounds(x, viewportBounds.y, width, viewportBounds.height);
  } else {
    const isToolbarTop = sharedBackstage.header.isPositionedAtTop();
    const { y, bottom } = getVerticalBounds(editor, contentAreaBox, viewportBounds, isToolbarTop, toolbarType, margin);
    return Boxes.bounds(x, y, width, bottom - y);
  }
};

export {
  getContextToolbarBounds,
  getAnchorElementBounds,
  getSelectionBounds,
  isVerticalOverlap
};
