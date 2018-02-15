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

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;

const showCaret = (direction, editor, node: Node, before: boolean): Range => {
  // TODO: Figure out a better way to handle this dependency
  return editor._selectionOverrides.showCaret(direction, node, before);
};

const getNodeRange = (node: Element): Range => {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = (editor, node: Element): Range => {
  let e;

  e = editor.fire('BeforeObjectSelected', { target: node });
  if (e.isDefaultPrevented()) {
    return null;
  }

  return getNodeRange(node);
};

const renderCaretAtRange = (editor, range: Range): Range => {
  let caretPosition, ceRoot;

  range = CaretUtils.normalizeRange(1, editor.getBody(), range);
  caretPosition = CaretPosition.fromRangeStart(range);

  if (isContentEditableFalse(caretPosition.getNode())) {
    return showCaret(1, editor, caretPosition.getNode(), !caretPosition.isAtEnd());
  }

  if (isContentEditableFalse(caretPosition.getNode(true))) {
    return showCaret(1, editor, caretPosition.getNode(true), false);
  }

  // TODO: Should render caret before/after depending on where you click on the page forces after now
  ceRoot = editor.dom.getParent(caretPosition.getNode(), (node) => isContentEditableFalse(node) || isContentEditableTrue(node));
  if (isContentEditableFalse(ceRoot)) {
    return showCaret(1, editor, ceRoot, false);
  }

  return null;
};

const renderRangeCaret = (editor, range: Range): Range => {
  let caretRange;

  if (!range || !range.collapsed) {
    return range;
  }

  caretRange = renderCaretAtRange(editor, range);
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