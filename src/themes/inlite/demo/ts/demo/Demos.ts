// /**
//  * Demo.js
//  *
//  * Released under LGPL License.
//  * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
//  *
//  * License: http://www.tinymce.com/license
//  * Contributing: http://www.tinymce.com/contributing
//  */

import EditorManager from 'tinymce/core/EditorManager';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import InliteTheme from 'tinymce/themes/inlite/Theme';

AnchorPlugin();
AutoLinkPlugin();
ContextMenuPlugin();
ImagePlugin();
LinkPlugin();
PastePlugin();
TablePlugin();
TextPatternPlugin();
InliteTheme();

EditorManager.init({
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