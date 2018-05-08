/**
 * CefUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import NodeType from '../dom/NodeType';
import { Editor } from 'tinymce/core/api/Editor';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;

const showCaret = (direction, editor: Editor, node: Element, before: boolean, scrollIntoView: boolean): Range => {
  // TODO: Figure out a better way to handle this dependency
  return editor._selectionOverrides.showCaret(direction, node, before, scrollIntoView);
};

const getNodeRange = (node: Element): Range => {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = (editor, node: Element): Range => {
  const e = editor.fire('BeforeObjectSelected', { target: node });
  if (e.isDefaultPrevented()) {
    return null;
  }

  return getNodeRange(node);
};

const renderCaretAtRange = (editor: Editor, range: Range, scrollIntoView: boolean): Range => {
  const normalizedRange = CaretUtils.normalizeRange(1, editor.getBody(), range);
  const caretPosition = CaretPosition.fromRangeStart(normalizedRange);

  const caretPositionNode = caretPosition.getNode();

  if (isContentEditableFalse(caretPositionNode)) {
    return showCaret(1, editor, caretPositionNode, !caretPosition.isAtEnd(), false);
  }

  const caretPositionBeforeNode = caretPosition.getNode(true);

  if (isContentEditableFalse(caretPositionBeforeNode)) {
    return showCaret(1, editor, caretPositionBeforeNode, false, false);
  }

  // TODO: Should render caret before/after depending on where you click on the page forces after now
  const ceRoot = editor.dom.getParent(caretPosition.getNode(), (node) => isContentEditableFalse(node) || isContentEditableTrue(node));
  if (isContentEditableFalse(ceRoot)) {
    return showCaret(1, editor, ceRoot, false, scrollIntoView);
  }

  return null;
};

const renderRangeCaret = (editor: Editor, range: Range, scrollIntoView: boolean): Range => {
  if (!range || !range.collapsed) {
    return range;
  }

  const caretRange = renderCaretAtRange(editor, range, scrollIntoView);
  if (caretRange) {
    return caretRange;
  }

  return range;
};

export {
  showCaret,
  selectNode,
  renderCaretAtRange,
  renderRangeCaret
};