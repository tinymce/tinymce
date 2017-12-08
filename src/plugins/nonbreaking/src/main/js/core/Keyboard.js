/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.nonbreaking.core.Keyboard',
  [
    'tinymce.core.util.VK',
    'tinymce.plugins.nonbreaking.api.Settings',
    'tinymce.plugins.nonbreaking.core.Actions'
  ],
  function (VK, Settings, Actions) {
    var setup = function (editor) {
      var spaces = Settings.getKeyboardSpaces(editor);

      if (spaces > 0) {
        editor.on('keydown', function (e) {
          if (e.keyCode === VK.TAB && !e.isDefaultPrevented()) {
            if (e.shiftKey) {
              return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();
            Actions.insertNbsp(editor, spaces);
          }
        });
      }
    };

    return {
      setup: setup
    };
  }
);