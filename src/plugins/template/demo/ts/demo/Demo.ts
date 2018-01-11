/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import TemplatePlugin from 'tinymce/plugins/template/Plugin';

declare let tinymce: any;

TemplatePlugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'template code',
  toolbar: 'template code',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  height: 600,
  templates: [
    { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
    { title: 'Some title 2', description: 'Some desc 2', content: 'My other content' }
  ]
});