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
  'tinymce.plugins.visualchars.demo.Demo',

  [
    'tinymce.plugins.visualchars.Plugin',
    'global!tinymce'
  ],
  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        plugins: "visualchars preview code",
        toolbar: "visualchars preview code",
        height: 600
      });
    };
  }
);