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
 * This class contains all core logic for the nonbreaking plugin.
 *
 * @class tinymce.nonbreaking.Plugin
 * @private
 */
define(
  'tinymce.plugins.nonbreaking.Plugin',
  [
    'tinymce.core.PluginManager'
  ],
  function (PluginManager) {
    PluginManager.add('nonbreaking', function (editor) {
      var setting = editor.getParam('nonbreaking_force_tab');
      var stringRepeat = function (string, repeats) {
        var str = '';
        for (var index = 0; index < repeats; index++) {
          str += string;
        }
        return str;
      };

      var insertNbsp = function (times) {
        var nbsp = (editor.plugins.visualchars && editor.plugins.visualchars.state) ? '<span class="mce-nbsp">&nbsp;</span>' : '&nbsp;';

        editor.insertContent(stringRepeat(nbsp, times));
        editor.dom.setAttrib(editor.dom.select('span.mce-nbsp'), 'data-mce-bogus', '1');
      };

      editor.addCommand('mceNonBreaking', function () {
        insertNbsp(1);
      });

      editor.addButton('nonbreaking', {
        title: 'Nonbreaking space',
        cmd: 'mceNonBreaking'
      });

      editor.addMenuItem('nonbreaking', {
        text: 'Nonbreaking space',
        cmd: 'mceNonBreaking',
        context: 'insert'
      });

      if (setting) {
        var spaces = +setting > 1 ? +setting : 3;  // defaults to 3 spaces if setting is true (or 1)

        editor.on('keydown', function (e) {
          if (e.keyCode == 9) {

            if (e.shiftKey) {
              return;
            }

            e.preventDefault();
            insertNbsp(spaces);
          }
        });
      }
    });

    return function () { };
  }
);