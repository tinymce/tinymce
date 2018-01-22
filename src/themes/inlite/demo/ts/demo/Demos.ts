/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  selector: 'div.tinymce',
  theme: 'inlite',
  plugins: 'image table link anchor paste contextmenu textpattern autolink',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  insert_toolbar: 'quickimage quicktable',
  selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  inline: true,
  paste_data_images: true,
  filepicker_validator_handler (query, success) {
    const valid = /^https?:/.test(query.url);

    success({
      status: valid ? 'valid' : 'invalid',
      message: valid ? 'Url seems to be valid' : 'Are you use that this url is valid?'
    });
  },
  file_picker_callback () { }
});

export default function () { }