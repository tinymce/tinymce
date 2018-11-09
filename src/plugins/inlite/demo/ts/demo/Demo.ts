/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

const inliteClassicConfig = {
  selector: 'textarea.tinymce',
  plugins: 'inlite link code',
  toolbar: 'inlite code',
  menubar: 'view insert tools custom',
  link_quicklink: true,
  height: 600,
  setup: (ed) => {
    ed.on('init', () => {
      ed.hasVisual = true;
      ed.addVisual();
    });

    ed.on('init', () => {
      ed.setContent('<h1>Heading</h1><p><a name="anchor1"></a>anchor here.');
    });
  }
};

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

tinymce.init(inliteClassicConfig);
tinymce.init(dfreeHeaderConfig);
tinymce.init(dfreeBodyConfig);

export {};
