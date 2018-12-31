import { Merger } from '@ephox/katamari';

declare let tinymce: any;

export default function () {
  const generalSettings = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    images_upload_url: 'd',
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
    mobile: {
      plugins: [
        'autosave lists'
      ]
    },
    plugins: [
      'autosave advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table directionality emoticons template paste textcolor importcss colorpicker textpattern',
      'codesample help noneditable print'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false
  };

  const iframeSettings = Merger.deepMerge(generalSettings, {
    toolbar: 'fontsizeselect fontselect insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl'
  });

  const inlineSettings = Merger.deepMerge(generalSettings, {
    inline: true,
    toolbar: [
      'fontsizeselect fontselect insertfile undo redo | styleselect',
      'bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
      'print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl'
    ]
  });

  tinymce.init(Merger.deepMerge(iframeSettings, {
    selector: '#left textarea',
    ui_container: '#left'
  }));

  tinymce.init(Merger.deepMerge(inlineSettings, {
    selector: '#left div.tinymce',
    ui_container: '#left'
  }));

  tinymce.init(Merger.deepMerge(iframeSettings, {
    selector: '#right textarea',
    ui_container: '#right'
  }));

  tinymce.init(Merger.deepMerge(inlineSettings, {
    selector: '#right div.tinymce',
    ui_container: '#right'
  }));
}
