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
  'tinymce.toc.demo.Demo',

  [
    'tinymce.toc.Plugin',
    'global!tinymce'
  ],
  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        plugins: "toc preview",
        toolbar: "toc preview formatselect",
        height: 600
      });
    };
  }
);