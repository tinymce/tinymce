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
  'tinymce.plugins.link.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.ui.Controls'
  ],
  function (PluginManager, Actions, Controls) {
    PluginManager.add('link', function (editor) {
      Controls.setupButtons(editor);
      Controls.setupMenuItems(editor);
      Controls.setupContextToolbars(editor);
      Actions.setupGotoLinks(editor);
      editor.addShortcut('Meta+K', '', Actions.openDialog(editor));
      editor.addCommand('mceLink', Actions.openDialog(editor));
    });

    return function () { };
  }
);