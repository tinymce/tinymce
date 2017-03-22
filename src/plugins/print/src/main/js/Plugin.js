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
 * This class contains all core logic for the print plugin.
 *
 * @class tinymce.print.Plugin
 * @private
 */
define(
  'tinymce.plugins.print.Plugin',
  [
    'tinymce.core.PluginManager'
  ],
  function (PluginManager) {
    PluginManager.add('print', function (editor) {
      editor.addCommand('mcePrint', function () {
        editor.getWin().print();
      });

      editor.addButton('print', {
        title: 'Print',
        cmd: 'mcePrint'
      });

      editor.addShortcut('Meta+P', '', 'mcePrint');

      editor.addMenuItem('print', {
        text: 'Print',
        cmd: 'mcePrint',
        icon: 'print',
        shortcut: 'Meta+P',
        context: 'file'
      });
    });

    return function () { };
  }
);