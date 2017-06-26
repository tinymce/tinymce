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

//       history.pushState(null, null, document.title);
// window.addEventListener('popstate', function () {
//   console.log('arguments', arguments);
//     history.pushState(null, null, document.title);
// });

      Theme();
      ListsPlugin;
      AutolinkPlugin;
      AutosavePlugin;

      EditorManager.init({
        selector: '.tiny-text',
        theme: 'mobile',
        plugins: 'lists, autolink autosave',
        mobile_skin_url: '../../main/css',
        add_unload_trigger: true
      });
    };
  }
);
