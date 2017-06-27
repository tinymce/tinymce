/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.themes.mobile.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.autolink.Plugin',
    'tinymce.plugins.autosave.Plugin',
    'tinymce.plugins.lists.Plugin',
    'tinymce.themes.mobile.Theme'
  ],
  function (EditorManager, AutolinkPlugin, AutosavePlugin, ListsPlugin, Theme) {
    return function () {
      Theme();
      ListsPlugin;
      AutolinkPlugin;
      AutosavePlugin;

      EditorManager.init({
        selector: '.tiny-text',
        theme: 'mobile',
        plugins: [
          'lists', // Required for list functionality (commands),
          'autolink', // Required for turning pasted text into hyperlinks
          'autosave' // Required to prevent users losing content when they press back
        ],
        mobile_skin_url: '../../main/css'
      });
    };
  }
);
