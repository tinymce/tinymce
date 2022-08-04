import { SugarElement } from '@ephox/sugar';

import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {

  const makeSidebar = (ed: Editor, name: string, background: string, width: number) => {
    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        const box = SugarElement.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom);
        return () => {
          api.element().removeChild(box.dom);
        };
      },
      onShow: (_api) => { },
      onHide: (_api) => { }
    });
  };

  const settings: RawEditorOptions = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    images_upload_url: 'd',
    selector: '#ephox-ui textarea',
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
    file_picker_callback: (callback, _value, meta) => {
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
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
    ],
    template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',
    image_caption: true,
    theme: 'silver',
    mobile: {
      theme: 'silver',
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
        'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table'
      ],
      toolbar: 'fullscreen bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image insertfile undo redo | styles'
    },
    setup: (ed) => {
      makeSidebar(ed, 'sidebar1', 'green', 200);
    },
    plugins: [
      'fullscreen', 'help', 'autosave', 'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'template', 'importcss', 'codesample', 'help'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'fullscreen undo redo fullscreen sidebar1 align fontsize fontfamily blocks styles insertfile | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code | ltr rtl',

    // Multiple toolbar array
    // toolbar: ['undo redo sidebar1 align fontsize insertfile | fontfamily blocks styles insertfile | styles | bold italic',
    // 'alignleft aligncenter alignright alignjustify | print preview media | forecolor backcolor emoticons table codesample code | ltr rtl',
    // 'bullist numlist outdent indent | link image'],

    // Toolbar<n>
    // toolbar1: 'undo redo sidebar1 align fontsize insertfile | fontfamily blocks styles insertfile | styles | bold italic',
    // toolbar2: 'alignleft aligncenter alignright alignjustify | print preview media | forecolor backcolor emoticons table codesample code | ltr rtl',
    // toolbar3: 'bullist numlist outdent indent | link image',

    // Toolbar with group names
    // toolbar: [
    //   {
    //     name: 'history', items: [ 'undo', 'redo' ]
    //   },
    //   {
    //     name: 'styles', items: [ 'styles' ]
    //   },
    //   {
    //     name: 'formatting', items: [ 'bold', 'italic']
    //   },
    //   {
    //     name: 'alignment', items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ]
    //   },
    //   {
    //     name: 'indentation', items: [ 'outdent', 'indent' ]
    //   },
    //   {
    //     name: 'permanent pen', items: [ 'permanentpen' ]
    //   },
    //   {
    //     name: 'comments', items: [ 'addcomment' ]
    //   }
    // ],
    toolbar_mode: 'sliding',
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js'
  };

  tinymce.init(settings);
  // tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
};
