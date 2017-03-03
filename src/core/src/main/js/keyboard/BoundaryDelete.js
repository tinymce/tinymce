/**
 * BoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundaryDelete',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Options',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Fun, Options, CaretContainer, CaretPosition, InlineUtils) {
    var selectAndDelete = function (editor, elm) {
      editor.selection.select(elm);
      editor.execCommand('Delete');
    };

    var isLastPosition = function (rootNode, forward, pos) {
      return InlineUtils.findCaretPosition(rootNode, forward, pos).map(function (newPos) {
        return InlineUtils.isAtInlineEndPoint(rootNode, newPos);
      }).getOr(false);
    };

    var deleteCollapsed = function (editor, from) {
      var rootNode = editor.getBody();
      if (InlineUtils.isInInline(rootNode, from) && CaretContainer.isAfterInline(from)) {
        if (isLastPosition(editor.getBody(), true, from)) {
          InlineUtils.findInline(rootNode, from).bind(Fun.curry(selectAndDelete, editor));
          return true;
        }
      }

      return false;
    };

    var backspaceCollapsed = function (editor, from) {
      var rootNode = editor.getBody();
      if (InlineUtils.isInInline(rootNode, from) && CaretContainer.isBeforeInline(from)) {
        if (isLastPosition(editor.getBody(), false, from)) {
          InlineUtils.findInline(rootNode, from).bind(Fun.curry(selectAndDelete, editor));
          return true;
        }
      }

      return false;
    };

    var backspaceDeleteCollapsed = function (editor, forward) {
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      return forward ? deleteCollapsed(editor, from) : backspaceCollapsed(editor, from);
    };

    var backspaceDelete = function (editor, forward) {
      return function () {
        if (editor.selection.isCollapsed()) {
          return backspaceDeleteCollapsed(editor, forward);
        }

        return false;
      };
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);