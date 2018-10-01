/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'template',
  toolbar: 'template',
  height: 600,
  template_preview_replace_values: {
    username: '<em>username here</em>'
  },
  template_replace_values: {
    username : 'Jack',
    staffid : '991234'
  },
  templates: [
    { title: 'Some title 1', description: 'Some desc 1', content: 'My content {$username}' },
    { title: 'Some title 2', description: 'Some desc 2', content: 'My other content' }
  ]
});

export {};