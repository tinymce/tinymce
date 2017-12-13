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
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  EmoticonsPlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "emoticons code",
    toolbar: "emoticons code",
    height: 600
  });
};