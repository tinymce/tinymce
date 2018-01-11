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
import CaretUtils from '../caret/CaretUtils';
import NodeType from '../dom/NodeType';
import Fun from '../util/Fun';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;

const showCaret = function (direction, editor, node, before) {
  // TODO: Figure out a better way to handle this dependency
  return editor._selectionOverrides.showCaret(direction, node, before);
};

const getNodeRange = function (node) {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = function (editor, node) {
  let e;

  e = editor.fire('BeforeObjectSelected', { target: node });
  if (e.isDefaultPrevented()) {
    return null;
  }

  return getNodeRange(node);
};

const renderCaretAtRange = function (editor, range) {
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
  ceRoot = editor.dom.getParent(caretPosition.getNode(), Fun.or(isContentEditableFalse, isContentEditableTrue));
  if (isContentEditableFalse(ceRoot)) {
    return showCaret(1, editor, ceRoot, false);
  }

  return null;
};

const renderRangeCaret = function (editor, range) {
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

export default {
  showCaret,
  selectNode,
  renderCaretAtRange,
  renderRangeCaret
};