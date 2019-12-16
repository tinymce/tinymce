import { Element } from '@ephox/sugar';

declare let tinymce: any;

export default function () {

  const makeSidebar = (ed, name: string, background: string, width: number) => {
    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        const box = Element.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom());
        return () => {
          api.element().removeChild(box.dom());
        };
      },
      onShow: (api) => {

      },
      onHide: (api) => {

      },
    });
  };

  const stickySettings = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
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
    theme: 'silver',
    mobile: {
      plugins: [
        'autosave lists'
      ]
    },
    setup (ed) {
      makeSidebar(ed, 'sidebar1', 'green', 200);
    },
    plugins: [
      'autosave advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen fullpage insertdatetime media nonbreaking',
      'save table directionality emoticons template paste importcss textpattern',
      'codesample help noneditable print'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'undo redo sidebar1 align fontsizeselect fontselect formatselect styleselect insertfile | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl',
    toolbar_mode: 'floating',
    toolbar_sticky: true
  };

  tinymce.init(stickySettings);
  tinymce.init({ ...stickySettings, inline: true, selector: '.tinymce' });
}
