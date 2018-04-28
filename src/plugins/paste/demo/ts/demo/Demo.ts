/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

// tslint:disable:no-console

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'paste code',
  toolbar: 'undo redo | pastetext code',
  init_instance_callback (editor) {
    editor.on('PastePreProcess', function (evt) {
      console.log(evt);
    });

    editor.on('PastePostProcess', function (evt) {
      console.log(evt);
    });
  },
  height: 600
});

export {};