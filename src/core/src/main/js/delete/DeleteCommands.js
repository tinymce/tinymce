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
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.delete.InlineBoundaryDelete',
    'tinymce.core.delete.TableDelete'
  ],
  function (BlockBoundaryDelete, BlockRangeDelete, CefDelete, DeleteUtils, BoundaryDelete, TableDelete) {
    var nativeCommand = function (editor, command) {
      editor.getDoc().execCommand(command, false, null);
    };

    var deleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (TableDelete.backspaceDelete(editor)) {
        return;
      } else if (BlockRangeDelete.backspaceDelete(editor, false)) {
        return;
      } else {
        nativeCommand(editor, 'Delete');
        DeleteUtils.paddEmptyBody(editor);
      }
    };

    var forwardDeleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (TableDelete.backspaceDelete(editor)) {
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