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
        theme: 'beta-mobile',
        toolbar: [ 'styleselect', 'undo', 'redo', 'bold', 'italic', 'underline', 'removeformat', 'link', 'unlink', 'image', 'fontsizeselect', 'bullist', 'numlist', 'forecolor' ],
        plugins: [
          'lists', // Required for list functionality (commands),
          'autolink', // Required for turning pasted text into hyperlinks
          'autosave' // Required to prevent users losing content when they press back
        ],
        mobile_skin_url: '../../main/css',

        style_formats: [
        //   { title: 'Alpha', format: 'bold' },
        //   {
        //     title: 'Beta',
        //     items: [
        //       { title: 'Beta-1', format: 'bold' },
        //       { title: 'Beta-2', format: 'bold' },
        //       {
        //         title: 'Beta-3',
        //         items: [
        //           {
        //             title: 'Beta-3-1',
        //             items: [
        //               { title: 'Beta-3-1-1', format: 'bold' }
        //             ]
        //           },
        //           { title: 'Beta-3-2' }
        //         ]
        //       }
        //     ]
        //   },
        //   { title: 'Gamma', format: 'bold' },
        //   { title: 'Gamma1', format: 'bold' },
        //   { title: 'Gamma2', format: 'bold' },
        //   { title: 'Gamma3', format: 'bold' },
        //   { title: 'Gamma4', format: 'bold' },
        //   { title: 'Gamma5', format: 'bold' },
        //   { title: 'Gamma6', format: 'bold' },
        //   { title: 'Gamma7', format: 'bold' },
        //   { title: 'Gamma8', format: 'bold' }
        // ]
        
        //style_formats: [
          
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
              { inline: 'span', title: 'Red text', icon: 'red', styles: { color: 'red' } },
    { title: 'Bold text', inline: 'strong' },
    { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
    { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
    { title: 'Badge', inline: 'span', styles: { display: 'inline-block', border: '1px solid #2276d2', 'border-radius': '5px', padding: '2px 5px', margin: '0 2px', color: '#2276d2' } },
    { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' },
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
       // */
      });
    };
  }
);
