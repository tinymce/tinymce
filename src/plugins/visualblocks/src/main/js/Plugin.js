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
  'tinymce.plugins.visualblocks.Plugin',
  [
    'ephox.katamari.api.Cell',
    'tinymce.core.PluginManager',
    'tinymce.plugins.visualblocks.api.Commands',
    'tinymce.plugins.visualblocks.core.Bindings',
    'tinymce.plugins.visualblocks.ui.Buttons'
  ],
  function (Cell, PluginManager, Commands, Bindings, Buttons) {
    PluginManager.add('visualblocks', function (editor, pluginUrl) {
      var enabledState = Cell(false);

      Commands.register(editor, pluginUrl, enabledState);
      Buttons.register(editor, enabledState);
      Bindings.setup(editor, pluginUrl, enabledState);
    });

    return function () { };
  }
);