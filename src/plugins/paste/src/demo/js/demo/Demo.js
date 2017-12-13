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
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  PastePlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "paste code",
    toolbar: "undo redo | pastetext code",
    init_instance_callback: function (editor) {
      editor.on('PastePreProcess', function (evt) {
        console.log(evt);
      });

      editor.on('PastePostProcess', function (evt) {
        console.log(evt);
      });
    },
    height: 600
  });
};