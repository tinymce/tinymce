/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  TemplatePlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    plugins: "template code",
    toolbar: "template code",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    height: 600,
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: 'My other content' }
    ]
  });
};