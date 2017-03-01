/**
 * ArrowKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.ArrowKeys',
  [
    'ephox.katamari.api.Cell',
    'tinymce.core.keyboard.InlineBoundaries',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Cell, InlineBoundaries, MatchKeys, VK) {
    var setup = function (editor) {
      var caret = Cell(null);

      editor.on('keydown', function (evt) {
        MatchKeys.match([
          { keyCode: VK.RIGHT, action: InlineBoundaries.move(editor, caret, true) },
          { keyCode: VK.LEFT, action: InlineBoundaries.move(editor, caret, false) }
        ], evt).map(function (match) {
          if (match.action()) {
            evt.preventDefault();
          }
        });
      });

      InlineBoundaries.setupSelectedState(editor, caret);
    };

    return {
      setup: setup
    };
  }
);
