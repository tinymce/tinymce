/**
 * DeleteBackspaceKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.DeleteBackspaceKeys',
  [
    'tinymce.core.keyboard.BoundaryDelete',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (BoundaryDelete, MatchKeys, VK) {
    var setup = function (editor) {
      editor.on('keydown', function (evt) {
        MatchKeys.match([
          { keyCode: VK.BACKSPACE, action: BoundaryDelete.backspaceDelete(editor, false) },
          { keyCode: VK.DELETE, action: BoundaryDelete.backspaceDelete(editor, true) }
        ], evt).map(function (action) {
          if (action()) {
            evt.preventDefault();
          }
        });
      });
    };

    return {
      setup: setup
    };
  }
);
