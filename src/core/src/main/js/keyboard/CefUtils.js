/**
 * CefUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.CefUtils',
  [
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.util.Fun'
  ],
  function (CaretPosition, CaretUtils, NodeType, Fun) {
    var isContentEditableTrue = NodeType.isContentEditableTrue;
    var isContentEditableFalse = NodeType.isContentEditableFalse;

    var showCaret = function (direction, editor, node, before) {
      // TODO: Figure out a better way to handle this dependency
      return editor._selectionOverrides.showCaret(direction, node, before);
    };

    var getNodeRange = function (node) {
      var rng = node.ownerDocument.createRange();
      rng.selectNode(node);
      return rng;
    };

    var selectNode = function (editor, node) {
      var e;

      e = editor.fire('BeforeObjectSelected', { target: node });
      if (e.isDefaultPrevented()) {
        return null;
      }

      return getNodeRange(node);
    };

    var renderCaretAtRange = function (editor, range) {
      var caretPosition, ceRoot;

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

    var renderRangeCaret = function (editor, range) {
      var caretRange;

      if (!range || !range.collapsed) {
        return range;
      }

      caretRange = renderCaretAtRange(editor, range);
      if (caretRange) {
        return caretRange;
      }

      return range;
    };

    return {
      showCaret: showCaret,
      selectNode: selectNode,
      renderCaretAtRange: renderCaretAtRange,
      renderRangeCaret: renderRangeCaret
    };
  }
);
