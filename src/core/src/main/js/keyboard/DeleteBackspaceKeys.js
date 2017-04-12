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
    'ephox.katamari.api.Arr',
    'tinymce.core.keyboard.BoundaryDelete',
    'tinymce.core.keyboard.CefDelete',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Arr, BoundaryDelete, CefDelete, MatchKeys, VK) {
    var setup = function (editor) {
      editor.on('keydown', function (evt) {
        var matches = MatchKeys.match([
          { keyCode: VK.BACKSPACE, action: BoundaryDelete.backspaceDelete(editor, false) },
          { keyCode: VK.DELETE, action: BoundaryDelete.backspaceDelete(editor, true) }
        ], evt);

        Arr.find(matches, function (pattern) {
          return pattern.action();
        }).each(function (_) {
          evt.preventDefault();
        });
      });
    };

    return {
      setup: setup
    };
  }
);
