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
    'tinymce.plugins.contextmenu.api.Settings',
    'tinymce.plugins.contextmenu.core.Coords',
    'tinymce.plugins.contextmenu.ui.ContextMenu'
  ],
  function (Settings, Coords, ContextMenu) {
    var isNativeOverrideKeyEvent = function (editor, e) {
      return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
    };

    var setup = function (editor, visibleState, menu) {
      editor.on('contextmenu', function (e) {
        if (isNativeOverrideKeyEvent(editor, e)) {
          return;
        }

        e.preventDefault();
        ContextMenu.show(editor, Coords.getPos(editor, e), visibleState, menu);
      });
    };

    return {
      setup: setup
    };
  }
);