/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.themes.mobile.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.autolink.Plugin',
    'tinymce.plugins.autosave.Plugin',
    'tinymce.plugins.lists.Plugin',
    'tinymce.themes.mobile.Theme'
  ],
  function (EditorManager, AutolinkPlugin, AutosavePlugin, ListsPlugin, Theme) { 
    return function () {
      Theme();
      ListsPlugin;
      AutolinkPlugin;
      AutosavePlugin;

      EditorManager.init({ 
        selector: '.tiny-text',
        theme: 'mobile',
        plugins: [
          'lists', // Required for list functionality (commands),
          'autolink', // Required for turning pasted text into hyperlinks
          'autosave' // Required to prevent users losing content when they press back
        ],
        mobile_skin_url: '../../main/css',

        style_formats: [
          {
            title: 'Headers',
            items: [
              { title: 'Header 1', format: 'h1' },
              { title: 'Header 2', format: 'h2' },
              { title: 'Header 3', format: 'h3' },
              { title: 'Header 4', format: 'h4' },
              { title: 'Header 5', format: 'h5' },
              { title: 'Header 6', format: 'h6' }
            ]
          },
          {
            title: 'Inline',
            items: [
              { title: 'Bold', icon: 'bold', format: 'bold' },
              { title: 'Italic', icon: 'italic', format: 'italic' },
              { title: 'Underline', icon: 'underline', format: 'underline' },
              { title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough' },
              { title: 'Superscript', icon: 'superscript', format: 'superscript' },
              { title: 'Subscript', icon: 'subscript', format: 'subscript' },
              { title: 'Code', icon: 'code', format: 'code' },
              { title: 'Red text', icon: 'red', styles: { color: 'red' } }
            ]
          },
          {
            title: 'Blocks',
            items: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' },
              { title: 'Div', format: 'div' },
              { title: 'Pre', format: 'pre' }
            ]
          },
          {
            title: 'Alignment',
            items: [
              { title: 'Left', icon: 'alignleft', format: 'alignleft' },
              { title: 'Center', icon: 'aligncenter', format: 'aligncenter' },
              { title: 'Right', icon: 'alignright', format: 'alignright' },
              { title: 'Justify', icon: 'alignjustify', format: 'alignjustify' }
            ]
          }
        ]
      });
    };
  }
);
