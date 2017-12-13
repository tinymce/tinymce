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
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  ImagePlugin();
  ModernTheme();

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "image code",
    toolbar: "undo redo | image code",
    image_caption: true,
    image_advtab: true,
    images_upload_url: 'postAcceptor.php',
    file_picker_callback: function (callback, value, meta) {
      callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
    },
    height: 600
  });
};