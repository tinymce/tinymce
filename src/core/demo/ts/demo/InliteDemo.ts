/**
 * FullDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

export default function () {

  const dfreeHeaderConfig = {
    selector: '.dfree-header',
    plugins: [ 'inlite' ],
    toolbar: false,
    menubar: false,
    inline: true,
    inlite_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote'
  };

  const dfreeBodyConfig = {
    selector: '.dfree-body',
    menubar: false,
    inline: true,
    theme: 'silver',
    plugins: [
      'autolink',
      'codesample',
      'contextmenu',
      'link',
      'lists',
      'table',
      'textcolor',
      'image',
      'inlite'
    ],
    toolbar: false,
    inlite_insert_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    inlite_selection_toolbar: 'bold italic | h2 h3 | blockquote quicklink',
    contextmenu: 'inserttable | cell row column deletetable',
  };

  tinymce.init(dfreeHeaderConfig);
  tinymce.init(dfreeBodyConfig);
}
