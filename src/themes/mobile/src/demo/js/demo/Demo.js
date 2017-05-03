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
    'tinymce.plugins.lists.Plugin',
    'tinymce.themes.mobile.Theme'
  ],
  function (EditorManager, ListsPlugin, Theme) {
    return function () {
      Theme();
      ListsPlugin;

      EditorManager.init({
        selector: '.tiny-text',
        theme: 'mobile',
        plugins: 'lists',
        mobile_skin_url: '../../main/css',
        readonly: 1
      });
    };
  }
);
