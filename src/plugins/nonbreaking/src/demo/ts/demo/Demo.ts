/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import NonBreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  NonBreakingPlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "nonbreaking code",
    toolbar: "nonbreaking code",
    height: 600
  });
};