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
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */

AutoLinkPlugin();
CodePlugin();
Theme();

export default <any> function () {
  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "autolink code",
    toolbar: "autolink code",
    height: 600
  });
};