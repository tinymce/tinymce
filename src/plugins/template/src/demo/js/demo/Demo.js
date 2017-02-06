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
  'tinymce.template.demo.Demo',

  [
    'tinymce.template.Plugin',
    'global!tinymce'
  ],
  function (Plugin, tinymce) {
    return function () {

      tinymce.init({
        selector: "textarea.tinymce",
        plugins: "template preview",
        toolbar: "template preview",
        height: 600,
        templates: [
          { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
          { title: 'Some title 2', description: 'Some desc 2', content: 'My other content' }
        ]
      });
    };
  }
);