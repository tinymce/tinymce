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
    'tinymce.core.delete.BlockBoundaryDelete',
    'tinymce.core.delete.BlockRangeDelete',
    'tinymce.core.delete.CefDelete',
    'tinymce.core.delete.InlineBoundaryDelete',
    'tinymce.core.keyboard.MatchKeys',
    'tinymce.core.util.VK'
  ],
  function (Arr, BlockBoundaryDelete, BlockRangeDelete, CefDelete, InlineBoundaryDelete, MatchKeys, VK) {
    var executeKeydownOverride = function (editor, caret, evt) {
      var matches = MatchKeys.match([
        { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, false) },
        { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, true) },
        { keyCode: VK.BACKSPACE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, false) },
        { keyCode: VK.DELETE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, true) },
        { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, false) },
        { keyCode: VK.DELETE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, true) },
        { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, false) },
        { keyCode: VK.DELETE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, true) }
      ], evt);

      Arr.find(matches, function (pattern) {
        return pattern.action();
      }).each(function (_) {
        evt.preventDefault();
      });
    };

    var executeKeyupOverride = function (editor, evt) {
      var matches = MatchKeys.match([
        { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) },
        { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) }
      ], evt);

      Arr.find(matches, function (pattern) {
        return pattern.action();
      });
    };

    var setup = function (editor, caret) {
      editor.on('keydown', function (evt) {
        if (evt.isDefaultPrevented() === false) {
          executeKeydownOverride(editor, caret, evt);
        }
      });

      editor.on('keyup', function (evt) {
        if (evt.isDefaultPrevented() === false) {
          executeKeyupOverride(editor, evt);
        }
      });
    };

    return {
      setup: setup
    };
  }
);
