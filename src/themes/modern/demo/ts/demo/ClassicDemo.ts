// /**
//  * ClassicDemo.js
//  *
//  * Released under LGPL License.
//  * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
//  *
//  * License: http://www.tinymce.com/license
//  * Contributing: http://www.tinymce.com/contributing
//  */
declare let tinymce: any;

export default function () {
  tinymce.init({
    selector: 'textarea.tinymce',
    theme: 'modern',
    plugins: [
      'advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template textcolor paste fullpage textcolor colorpicker codesample'
    ],
    skin_url: '../../../../../js/tinymce/skins/lightgray',
    add_unload_trigger: false,
    autosave_ask_before_unload: false,

    toolbar1: 'save newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright ' +
      'alignjustify | styleselect formatselect fontselect fontsizeselect',
    toolbar2: 'cut copy paste pastetext | searchreplace | bullist numlist | outdent indent blockquote | undo redo' +
      ' | link unlink anchor image media help code | insertdatetime preview | forecolor backcolor',
    toolbar3: 'table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl' +
      ' | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft | insertfile insertimage codesample',
    menubar: false,
    toolbar_items_size: 'small',

    style_formats: [
      { title: 'Bold text', inline: 'b' },
      { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
      { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
      { title: 'Example 1', inline: 'span', classes: 'example1' },
      { title: 'Example 2', inline: 'span', classes: 'example2' },
      { title: 'Table styles' },
      { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
    ],

    templates: [
      { title: 'My template 1', description: 'Some fancy template 1', content: 'My html' },
      { title: 'My template 2', description: 'Some fancy template 2', url: 'development.html' }
    ],

    spellchecker_callback (method, data, success) {
      if (method === 'spellcheck') {
        const words = data.match(this.getWordCharPattern());
        const suggestions = {};

        for (let i = 0; i < words.length; i++) {
          suggestions[words[i]] = ['First', 'second'];
        }

        success({ words: suggestions, dictionary: true });
      }

      if (method === 'addToDictionary') {
        success();
      }
    }
  });
}