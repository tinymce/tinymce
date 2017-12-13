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
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  CodePlugin();
  TablePlugin();
  ContextMenuPlugin();
  ModernTheme();
  PastePlugin();

  EditorManager.init({
    selector: "div.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "table code contextmenu paste",
    toolbar: "table code",
    media_dimensions: false,
    // media_live_embeds: false,
    // media_url_resolver: function (data, resolve) {
    // resolve({
    //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
    // },
    height: 600
  });
};