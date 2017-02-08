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
  'tinymce.plugins.paste.demo.Demo',

  [
    'tinymce.plugins.paste.Plugin',
    'global!tinymce'
  ],

  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        theme: "modern",
        plugins: "paste code preview",
        toolbar: "pastetext code preview",
        init_instance_callback: function (editor) {
          editor.on('PastePreProcess', function (evt) {
            console.log(evt);
          });

          editor.on('PastePostProcess', function (evt) {
            console.log(evt);
          });
        },
        height: 600
      });
    };
  }
);