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
  'tinymce.plugins.autoresize.demo.Demo',

  [
    'tinymce.plugins.autoresize.Plugin',
    'global!tinymce'
  ],

  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        theme: "modern",
        plugins: "autoresize code preview",
        toolbar: "autoresize code preview",
        height: 600
      });
    };
  }
);