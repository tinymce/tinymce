/* eslint-disable no-console */
import { Fun, Merger } from '@ephox/katamari';

import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const registerUi = (editor: Editor) => {
    editor.ui.registry.addContextForm('text', {
      type: 'contextform',
      launch: {
        type: 'contextformbutton',
        text: 'Alt',
        tooltip: 'Alt'
      },
      onSetup: (api) => {
        console.log('setup context form');

        return () => {
          console.log('teardown context form', api.getValue());
        };
      },
      onInput: (api) => {
        console.log('text', api.getValue());
      },
      label: 'Alt',
      commands: [
        {
          type: 'contextformbutton',
          align: 'start',
          icon: 'chevron-left',
          onAction: (formApi) => {
            formApi.back();
          }
        },
        {
          type: 'contextformtogglebutton',
          align: 'start',
          text: 'Decorative',
          onAction: (formApi, buttonApi) => {
            buttonApi.setActive(!buttonApi.isActive());
            formApi.setInputEnabled(!formApi.isInputEnabled());
          }
        }
      ]
    });

    editor.ui.registry.addContextForm('size', {
      type: 'contextsizeinputform',
      launch: {
        type: 'contextformbutton',
        text: 'Size',
        tooltip: 'Size'
      },
      initValue: () => ({ width: '400', height: '300' }),
      onInput: (api) => {
        console.log('size', api.getValue());
      },
      label: 'Size',
      commands: [
        {
          type: 'contextformbutton',
          align: 'start',
          icon: 'chevron-left',
          onAction: (formApi) => {
            formApi.hide();
          }
        },
        {
          type: 'contextformbutton',
          text: 'Reset',
          onAction: (formApi) => {
            formApi.setValue({ width: '400', height: '300' });
          }
        }
      ]
    });

    editor.ui.registry.addContextForm('slider', {
      type: 'contextsliderform',
      launch: {
        type: 'contextformbutton',
        text: 'Brightness',
        tooltip: 'Brightness'
      },
      min: Fun.constant(-100),
      max: Fun.constant(100),
      initValue: Fun.constant(0),
      onInput: (api) => {
        console.log('onInput', api.getValue());
      },
      label: 'Brightness',
      commands: [
        {
          type: 'contextformbutton',
          align: 'start',
          icon: 'chevron-left',
          onAction: (formApi) => {
            formApi.hide();
          }
        },
        {
          type: 'contextformbutton',
          primary: true,
          text: 'Apply',
          onAction: (formApi) => {
            formApi.hide();
            editor.focus();
          }
        },
        {
          type: 'contextformbutton',
          text: 'Reset',
          onAction: (formApi) => {
            formApi.setValue(50);
          }
        }
      ]
    });

    editor.ui.registry.addContextToolbar('contexttoolbar1', {
      predicate: (node) => node.nodeName === 'IMG',
      items: 'text slider size',
      position: 'node',
      scope: 'node'
    });
  };

  const settings: RawEditorOptions = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    content_langs: [
      { title: 'English (US)', code: 'en_us' },
      { title: 'Spanish', code: 'es' },
      { title: 'English (US Medical)', code: 'en_us', customCode: 'en_us_medical' }
    ],
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
    // init_content_sync: true,
    height: 400,
    image_advtab: true,
    file_picker_callback: (callback, _value, meta) => {
      if (meta.fieldname === 'poster') {
        callback('test.mp4', { altsource: 'blah.ogg', width: '400px', poster: 'testing.jpg', embed: '<p>test</p>' });
        return;
      }
      // Provide file and text for the link dialog
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', { text: 'My text', title: 'blah' });
      }

      // Provide image and alt text for the image dialog
      if (meta.filetype === 'image') {
        // tslint:disable-next-line: no-debugger
        callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text', style: 'border: 10px solid black;' });
      }

      // Provide alternative source and posted for the media dialog
      if (meta.filetype === 'media') {
        callback('movie.mp4', { embed: '<p>test</p>' });
      }
    },
    image_caption: true,
    theme: 'silver',
    setup: (editor) => {
      registerUi(editor);
    },
    plugins: [
      'autosave', 'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'importcss', 'codesample', 'help', 'accordion'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'undo redo sidebar1 fontsizeinput | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl',
    contextmenu: 'link linkchecker image table lists configurepermanentpen',
    toolbar_mode: 'floating',
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
    resize_img_proportional: true,
    format_empty_lines: true
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
};

