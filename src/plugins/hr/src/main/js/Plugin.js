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
 * This class contains all core logic for the hr plugin.
 *
 * @class tinymce.hr.Plugin
 * @private
 */
define(
  'tinymce.plugins.hr.Plugin',
  [
    'tinymce.core.PluginManager'
  ],
  function (PluginManager) {
    PluginManager.add('hr', function (editor) {
      editor.addCommand('InsertHorizontalRule', function () {
        editor.execCommand('mceInsertContent', false, '<hr />');
      });

      editor.addButton('hr', {
        icon: 'hr',
        tooltip: 'Horizontal line',
        cmd: 'InsertHorizontalRule'
      });

      editor.addMenuItem('hr', {
        icon: 'hr',
        text: 'Horizontal line',
        cmd: 'InsertHorizontalRule',
        context: 'insert'
      });
    });

    return function () { };
  }
);