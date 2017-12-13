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
import ImportCssPlugin from 'tinymce/plugins/importcss/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  ImportCssPlugin();
  ModernTheme();

  var elm: any = document.querySelector('.tinymce');
  elm.value = 'The format menu should show "red"';

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "importcss code",
    toolbar: "styleselect code",
    height: 600,
    content_css: '../css/rules.css'
  });
};