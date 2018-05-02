/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { document } from '@ephox/dom-globals';

 // tslint:disable:no-console

declare let tinymce: any;

export default function () {
  const config = {
    theme: 'modern',
    plugins: [
      'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern codesample'
    ],
    /*
    menubar: 'file edit insert view format table tools',
    menu: {
      file: { title: 'File', items: 'newdocument' },
      edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
      insert: { title: 'Insert', items: 'link media | template hr' },
      view: { title: 'View', items: 'visualaid' },
      format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat' },
      table: { title: 'Table', items: 'inserttable tableprops deletetable | cell row column' },
      tools: { title: 'Tools', items: 'spellchecker code' }
    },
    removed_menuitems: 'undo',
    */
    // resize: 'both',
    // statusbar: false,
    // menubar: false,
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample',

    setup (ed) {
      ed.addSidebar('sidebar1', {
        tooltip: 'My side bar 1',
        icon: 'bold',
        onrender (api) {
          const rect = api.element().getBoundingClientRect();
          const panel = tinymce.ui.Factory.create({
            layout: 'flex',
            direction: 'column',
            pack: 'center',
            align: 'center',
            minWidth: rect.width,
            minHeight: rect.height,
            type: 'panel',
            items: [
              { type: 'button', text: 'Hello world!' }, { type: 'button', text: 'Hello world!' }
            ]
          });
          panel.renderTo(api.element()).reflow();
          console.log('Render panel 1');
        },
        onshow (api) {
          console.log('Show panel 1', api.element());
        },
        onhide (api) {
          console.log('Hide panel 1', api.element());
        }
      });

      ed.addSidebar('sidebar2', {
        tooltip: 'My side bar 2',
        icon: 'italic',
        onrender (api) {
          console.log('Render panel 2', api.element());
        },
        onshow (api) {
          console.log('Show panel 2', api.element());
          api.element().innerHTML = document.body.innerText;
        },
        onhide (api) {
          console.log('Hide panel 2', api.element());
        }
      });
    }
  };

  tinymce.init(
    tinymce.util.Tools.extend({}, config, {
      selector: 'textarea.tinymce',
      skin_url: '../../../../../js/tinymce/skins/lightgray',
      codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css'
    })
  );

  tinymce.init(
    tinymce.util.Tools.extend({}, config, {
      selector: 'div.tinymce',
      inline: true,
      skin_url: '../../../../../js/tinymce/skins/lightgray',
      codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css'
    })
  );
}