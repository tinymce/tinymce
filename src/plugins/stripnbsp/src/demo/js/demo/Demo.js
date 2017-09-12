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
  'tinymce.plugins.stripnbsp.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.link.Plugin',
    'tinymce.plugins.stripnbsp.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (EditorManager, CodePlugin, LinkPlugin, StripnbspPlugin, ModernTheme) {
    return function () {
      CodePlugin();
      LinkPlugin();
      StripnbspPlugin();
      ModernTheme();

      EditorManager.init({
        selector: "textarea.tinymce#elm1",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "link code",
        toolbar: "link code",
        height: 300
      });

      EditorManager.init({
        selector: "textarea.tinymce#elm2",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "link code stripnbsp",
        toolbar: "link code",
        height: 300
      });

      EditorManager.init({
        selector: "textarea.tinymce#elm3",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "link code stripnbsp",
        toolbar: "link code",
        stripnbsp_force: true,
        height: 300
      });
    };
  }
);
