/**
 * Bind.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.contextmenu.core.Bind',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.plugins.contextmenu.api.Settings',
    'tinymce.plugins.contextmenu.core.RangePoint',
    'tinymce.plugins.contextmenu.ui.ContextMenu'
  ],
  function (DOMUtils, Env, Settings, RangePoint, ContextMenu) {
    var isNativeOverrideKeyEvent = function (editor, e) {
      return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
    };

    var setup = function (editor, visibleState, menu) {
      editor.on('contextmenu', function (e) {
        var x = e.pageX, y = e.pageY;

        if (!editor.inline) {
          var pos = DOMUtils.DOM.getPos(editor.getContentAreaContainer());
          x = pos.x + e.clientX;
          y = pos.y + e.clientY;
        }

        if (isNativeOverrideKeyEvent(editor, e)) {
          return;
        }

        e.preventDefault();

        ContextMenu.show(editor, x, y, visibleState, menu);
      });
    };

    return {
      setup: setup
    };
  }
);