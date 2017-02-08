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
  'tinymce.plugins.tabfocus.demo.Demo',

  [
    'tinymce.plugins.tabfocus.Plugin',
    'global!tinymce'
  ],
  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        plugins: "tabfocus preview",
        toolbar: "preview",
        height: 600
      });
    };
  }
);