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
  'tinymce.plugins.media.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.media.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (EditorManager, CodePlugin, MediaPlugin, ModernTheme) {
    return function () {
      CodePlugin();
      MediaPlugin();
      ModernTheme();

      window.tinymce = EditorManager;

      EditorManager.init({
        selector: "textarea.tinymce",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "media code",
        toolbar: "undo redo | media code",
        // media_dimensions: false,
        // media_live_embeds: false,
        file_picker_callback: function (callback, value, meta) {
          // Provide alternative source and posted for the media dialog
          if (meta.filetype === 'media') {
            callback('https://youtu.be/a4tNU2jgTZU');
          }
        },
        // media_url_resolver: function (data, resolve) {
        //   setTimeout(function () {
        //     resolve({
        //       html: '<div style="max-width: 650px;" data-ephox-embed-iri="https://youtu.be/a4tNU2jgTZU"><iframe src="https://www.youtube.com/embed/a4tNU2jgTZU?feature=oembed" width="612" height="344" frameborder="0" allowfullscreen="allowfullscreen"></iframe></div>' });
        //   }, 500);
        // },
        height: 600
      });
    };
  }
);
