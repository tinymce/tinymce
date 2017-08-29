/**
 * EnterKey.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.EnterKey',
  [
    'tinymce.core.keyboard.InsertNewLine',
    'tinymce.core.util.VK'
  ],
  function (InsertNewLine, VK) {
    var endTypingLevel = function (undoManager) {
      if (undoManager.typing) {
        undoManager.typing = false;
        undoManager.add();
      }
    };

    var handleEnterKeyEvent = function (editor, event) {
      if (event.isDefaultPrevented()) {
        return;
      }

      event.preventDefault();

      endTypingLevel(editor.undoManager);
      editor.undoManager.transact(function () {
        if (editor.selection.isCollapsed() === false) {
          editor.execCommand('Delete');
        }

        InsertNewLine.insert(editor, event);
      });
    };

    var setup = function (editor) {
      editor.on('keydown', function (event) {
        if (event.keyCode === VK.ENTER) {
          handleEnterKeyEvent(editor, event);
        }
      });
    };

    return {
      setup: setup
    };
  }
);
