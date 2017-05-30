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
    'tinymce.core.keyboard.CefNavigation',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Arr, Cell, BoundarySelection, CefNavigation, MatchKeys, VK) {
    var executeKeydownOverride = function (editor, caret, evt) {
      var matches = MatchKeys.match([
        { keyCode: VK.RIGHT, action: CefNavigation.moveH(editor, true) },
        { keyCode: VK.LEFT, action: CefNavigation.moveH(editor, false) },
        { keyCode: VK.UP, action: CefNavigation.moveV(editor, false) },
        { keyCode: VK.DOWN, action: CefNavigation.moveV(editor, true) },
        { keyCode: VK.RIGHT, action: BoundarySelection.move(editor, caret, true) },
        { keyCode: VK.LEFT, action: BoundarySelection.move(editor, caret, false) }
      ], evt);

      Arr.find(matches, function (pattern) {
        return pattern.action();
      }).each(function (_) {
        evt.preventDefault();
      });
    };

    var setup = function (editor, caret) {
      editor.on('keydown', function (evt) {
        if (evt.isDefaultPrevented() === false) {
          executeKeydownOverride(editor, caret, evt);
        }
      });
    };

    return {
      setup: setup
    };
  }
);
