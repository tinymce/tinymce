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
        toolbar: [ 'styleselect', 'undo', 'redo', 'bold', 'bold', 'italic', 'underline', 'styleselect', 'removeformat', 'link', 'unlink', 'image', 'fontsizeselect', 'bullist', 'numlist', 'forecolor' ],
        plugins: [
          'lists', // Required for list functionality (commands),
          'autolink', // Required for turning pasted text into hyperlinks
          'autosave' // Required to prevent users losing content when they press back
        ],
        skin_url: '../../../../../skins/lightgray/dist/lightgray',

        setup: function (ed) {
          ed.on('skinLoaded', function () {
            // Notification fields for equality: type, text, progressBar, timeout
            ed.notificationManager.open({
              text: 'You will not see this because the mobile theme has no notifications',
              type: 'info'
            });
          });
        },

        style_formats: [
          {
            title: 'Headings', items: [
              { title: 'Heading 1', format: 'h1' },
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Heading 6', format: 'h6' }
            ]
          },

          {
            title: 'Inline', items: [
              { title: 'Bold', icon: 'bold', format: 'bold' },
              { title: 'Italic', icon: 'italic', format: 'italic' },
              { title: 'Underline', icon: 'underline', format: 'underline' },
              { title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough' },
              { title: 'Superscript', icon: 'superscript', format: 'superscript' },
              { title: 'Subscript', icon: 'subscript', format: 'subscript' },
              { title: 'Code', icon: 'code', format: 'code' }
            ]
          },

          {
            // Should not appear when not in a table.
            title: 'Table', items: [
              { title: 'Rows', items: [
                { title: 'Cell', selector: 'tr', styles: { 'background': 'red' } }
              ] }
            ]
          },

          {
            title: 'Blocks', items: [
              { title: 'Paragraph', format: 'p', selector: 'address' },
              { title: 'Blockquote', format: 'blockquote', selector: 'address' },
              { title: 'Div', format: 'div', selector: 'address' },
              { title: 'Pre', format: 'pre', selector: 'address' }
            ]
          },

          {
            title: 'Alignment', items: [
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
