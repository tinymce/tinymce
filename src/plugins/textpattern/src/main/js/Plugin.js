/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.textpattern.Plugin
 * @private
 */
define(
  'tinymce.plugins.textpattern.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.VK',
    'tinymce.plugins.textpattern.core.Settings',
    'tinymce.plugins.textpattern.core.KeyHandler',
    'tinymce.plugins.textpattern.core.Formatter'
  ],
  function (PluginManager, VK, Settings, KeyHandler, Formatter) {
    PluginManager.add('textpattern', function (editor) {
      var patterns = Settings.getPatterns(editor.settings);

      editor.on('keydown', function (e) {
        if (e.keyCode == 13 && !VK.modifierPressed(e)) {
          KeyHandler.handleEnter(editor, patterns);
        }
      }, true);

      editor.on('keyup', function (e) {
        if (e.keyCode == 32 && !VK.modifierPressed(e)) {
          KeyHandler.handleSpace(editor, patterns);
        }
      });

      this.setPatterns = function (newPatterns) {
        patterns = newPatterns;
      };
      this.getPatterns = function () {
        return patterns;
      };
    });

    return function () { };
  }
);