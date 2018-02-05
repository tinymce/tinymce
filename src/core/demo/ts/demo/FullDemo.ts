/**
 * FullDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Merger } from '@ephox/katamari';

declare let tinymce: any;

export default function () {

  const settings = {
    skin_url: '../../../../js/tinymce/skins/lightgray',
    codesample_content_css: '../../../../js/tinymce/plugins/codesample/css/prism.css',
    visualblocks_content_css: '../../../../js/tinymce/plugins/visualblocks/css/visualblocks.css',
    images_upload_url: 'd',
    selector: 'textarea',
    // rtl_ui: true,
    link_list: [
      { title: 'My page 1', value: 'http://www.tinymce.com' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_list: [
      { title: 'My page 1', value: 'http://www.tinymce.com' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_class_list: [
      { title: 'None', value: '' },
      { title: 'Some class', value: 'class-name' }
    ],
    importcss_append: true,
    height: 400,
    file_picker_callback (callback, value, meta) {
      // Provide file and text for the link dialog
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
      }

      // Provide image and alt text for the image dialog
      if (meta.filetype === 'image') {
        callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
      }

      // Provide alternative source and posted for the media dialog
      if (meta.filetype === 'media') {
        callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
      }
    },
    spellchecker_callback (method, text, success, failure) {
      const words = text.match(this.getWordCharPattern());

      if (method === 'spellcheck') {
        const suggestions = {};

        for (let i = 0; i < words.length; i++) {
          suggestions[words[i]] = ['First', 'Second'];
        }

        success(suggestions);
      }

      if (method === 'addToDictionary') {
        success();
      }
    },
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
    ],
    template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',
    image_caption: true,
    theme: 'modern',
    mobile: {
      plugins: [
        'autosave lists'
      ]
    },
    plugins: [
      'autosave advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern',
      'codesample help noneditable print'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'fontsizeselect fontselect insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl'
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
}
