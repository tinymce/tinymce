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
    'tinymce.core.util.Delay',
    'tinymce.core.util.VK',
    'tinymce.plugins.textpattern.core.Formatter',
    'tinymce.plugins.textpattern.core.KeyHandler',
    'tinymce.plugins.textpattern.core.Settings'
  ],
  function (PluginManager, Delay, VK, Formatter, KeyHandler, Settings) {
    PluginManager.add('textpattern', function (editor) {
      var patterns = Settings.getPatterns(editor.settings);
      var charCodes = [',', '.', ';', ':', '!', '?'];
      var keyCodes = [32];

      editor.on('keydown', function (e) {
        if (e.keyCode === 13 && !VK.modifierPressed(e)) {
          KeyHandler.handleEnter(editor, patterns);
        }
      }, true);

      editor.on('keyup', function (e) {
        if (KeyHandler.checkKeyCode(keyCodes, e)) {
          KeyHandler.handleInlineKey(editor, patterns);
        }
      });

      editor.on('keypress', function (e) {
        if (KeyHandler.checkCharCode(charCodes, e)) {
          Delay.setEditorTimeout(editor, function () {
            KeyHandler.handleInlineKey(editor, patterns);
          });
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