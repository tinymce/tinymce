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
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  TextPatternPlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    plugins: "textpattern code",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    toolbar: "code",
    height: 600
  });
};