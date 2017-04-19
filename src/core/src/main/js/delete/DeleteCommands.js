/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteCommands',
  [
    'tinymce.core.delete.BlockBoundaryDelete',
    'tinymce.core.delete.BlockRangeDelete',
    'tinymce.core.delete.CefDelete',
    'tinymce.core.delete.InlineBoundaryDelete'
  ],
  function (BlockBoundaryDelete, BlockRangeDelete, CefDelete, BoundaryDelete) {
    var nativeCommand = function (editor, command) {
      editor.getDoc().execCommand(command, false, null);
    };

    var paddEmptyBody = function (editor) {
      var dom = editor.dom;

      // Check if body is empty after the delete call if so then set the contents
      // to an empty string and move the caret to any block produced by that operation
      // this fixes the issue with root blocks not being properly produced after a delete call on IE
      var body = editor.getBody();

      if (dom.isEmpty(body)) {
        editor.setContent('');

        if (body.firstChild && dom.isBlock(body.firstChild)) {
          editor.selection.setCursorLocation(body.firstChild, 0);
        } else {
          editor.selection.setCursorLocation(body, 0);
        }
      }
    };

    var deleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BlockRangeDelete.backspaceDelete(editor, false)) {
        return;
      } else {
        nativeCommand(editor, 'Delete');
        paddEmptyBody(editor);
      }
    };

    var forwardDeleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BlockRangeDelete.backspaceDelete(editor, true)) {
        return;
      } else {
        nativeCommand(editor, 'ForwardDelete');
      }
    };

    return {
      deleteCommand: deleteCommand,
      forwardDeleteCommand: forwardDeleteCommand
    };
  }
);