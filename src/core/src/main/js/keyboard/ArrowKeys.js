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
    'tinymce.core.keyboard.BoundarySelection',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Cell, BoundarySelection, MatchKeys, VK) {
    var setup = function (editor) {
      var caret = Cell(null);

      editor.on('keydown', function (evt) {
        MatchKeys.match([
          { keyCode: VK.RIGHT, action: BoundarySelection.move(editor, caret, true) },
          { keyCode: VK.LEFT, action: BoundarySelection.move(editor, caret, false) }
        ], evt).map(function (action) {
          if (action()) {
            evt.preventDefault();
          }
        });
      });

      BoundarySelection.setupSelectedState(editor, caret);
    };

    return {
      setup: setup
    };
  }
);
