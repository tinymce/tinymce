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
import BbCodePlugin from 'tinymce/plugins/bbcode/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0, no-unused-vars: 0 */

BbCodePlugin();
CodePlugin();
ModernTheme();

export default <any> function () {
  var elm: any;
  elm = document.querySelector('.tinymce');
  elm.value = '[b]bbcode plugin[/b]';

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "bbcode code",
    toolbar: "bbcode code",
    height: 600
  });
};