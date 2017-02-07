/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0, no-unused-vars: 0 */

define(
  'tinymce.plugins.bbcode.demo.Demo',

  [
    'global!tinymce',
    'tinymce.plugins.bbcode.Plugin'
  ],

  function (tinymce, Plugin) {
    return function () {
      document.querySelector('.tinymce').value = '[b]bbcode plugin[/b]';

      tinymce.init({
        selector: "textarea.tinymce",
        theme: "modern",
        plugins: "bbcode code preview",
        toolbar: "bbcode code preview",
        height: 600
      });


      // tinymce.activeEditor.setContent('<p>dog</p>');
    };
  }
);