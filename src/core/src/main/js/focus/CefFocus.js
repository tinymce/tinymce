/**
 * CefFocus.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.focus.CefFocus',
  [
    'ephox.katamari.api.Throttler',
    'tinymce.core.keyboard.CefUtils'
  ],
  function (Throttler, CefUtils) {
    var setup = function (editor) {
      var renderFocusCaret = Throttler.first(function () {
        if (!editor.removed) {
          var caretRange = CefUtils.renderRangeCaret(editor, editor.selection.getRng());
          editor.selection.setRng(caretRange);
        }
      }, 0);

      editor.on('focus', function () {
        renderFocusCaret.throttle();
      });

      editor.on('blur', function () {
        renderFocusCaret.cancel();
      });
    };

    return {
      setup: setup
    };
  }
);
