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
import Theme from 'tinymce/themes/modern/Theme';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';

/*eslint no-console:0 */

Theme();
AnchorPlugin();
CodePlugin();

export default <any> function () {
  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "anchor code",
    toolbar: "anchor code",
    height: 600
  });
};