/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.visualchars.Plugin',
  [
    'ephox.katamari.api.Cell',
    'tinymce.core.PluginManager',
    'tinymce.plugins.visualchars.api.Commands',
    'tinymce.plugins.visualchars.core.Keyboard',
    'tinymce.plugins.visualchars.ui.Buttons'
  ],
  function (Cell, PluginManager, Commands, Keyboard, Buttons) {
    PluginManager.add('visualchars', function (editor) {
      var toggleState = Cell(false);

      Commands.register(editor, toggleState);
      Buttons.register(editor);
      Keyboard.setup(editor, toggleState);
    });

    return function () {};
  }
);