/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.plugins.table.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.table.Plugin',
    'tinymce.plugins.contextmenu.Plugin',
    'tinymce.plugins.paste.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (EditorManager, CodePlugin, TablePlugin, ContextMenuPlugin, PastePlugin, ModernTheme) {
    return function () {
      CodePlugin();
      TablePlugin();
      ContextMenuPlugin();
      ModernTheme();
      PastePlugin();

      EditorManager.init({
        selector: "div.tinymce",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "table code contextmenu paste",
        toolbar: "table code",
        media_dimensions: false,
        // media_live_embeds: false,
        // media_url_resolver: function (data, resolve) {
        // resolve({
        //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
        // },
        height: 600
      });
    };
  }
);
