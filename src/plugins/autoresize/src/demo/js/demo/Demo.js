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
import AutoResizePlugin from 'tinymce/plugins/autoresize/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */

AutoResizePlugin();
CodePlugin();
ModernTheme();

export default <any> function () {
  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "autoresize code",
    toolbar: "autoresize code",
    height: 600
  });
};