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
import ColorPickerPlugin from 'tinymce/plugins/colorpicker/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  ColorPickerPlugin();
  TablePlugin();
  ModernTheme();

  document.querySelector('.tinymce').value = '<table><tbody><tr><td>One</td></tr></tbody></table>';

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "table colorpicker code",
    toolbar: "table code",
    height: 600
  });
};