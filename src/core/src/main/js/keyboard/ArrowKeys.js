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
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'tinymce.core.keyboard.BoundarySelection',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Arr, Cell, BoundarySelection, MatchKeys, VK) {
    var setup = function (editor, caret) {
      editor.on('keydown', function (evt) {
        var matches = MatchKeys.match([
          { keyCode: VK.RIGHT, action: BoundarySelection.move(editor, caret, true) },
          { keyCode: VK.LEFT, action: BoundarySelection.move(editor, caret, false) }
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
