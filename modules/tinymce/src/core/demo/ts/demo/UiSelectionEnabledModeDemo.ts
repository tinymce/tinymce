/* eslint-disable no-console */
import { Cell, Merger } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const buildModes = (ed: Editor) => {
    const selectedMode = Cell<string>(ed.mode.get());
    const setMode = (mode: string) => {
      ed.mode.set(mode);
      selectedMode.set(mode);
    };
    const makeModeUI = (mode: string) => {
      const toggleSpec = {
        text: `${mode} Mode`,
        onAction: () => {
          console.log('Current mode: ', ed.mode.get());
          ed.mode.get() === mode ? ed.mode.set(selectedMode.get()) : setMode(mode);
          console.log('New mode: ', ed.mode.get());
        },
        onSetup: (api: any) => {
          const toggleActive = () => {
            api.setActive(ed.mode.get() === mode);
            api.setEnabled(true);
          };
          toggleActive();
          ed.on('SwitchMode', toggleActive);
          return () => ed.off('SwitchMode', toggleActive);
        },
        allowedModes: [ 'design', 'readonly' ]
      };
      ed.ui.registry.addToggleMenuItem(mode, toggleSpec);
      ed.ui.registry.addToggleButton(mode, toggleSpec);
    };
    ed.mode.register('readonlyUIMode', {
      activate: () => console.log('Readonly UI: Activated'),
      deactivate: () => console.log('Readonly UI: Deactivated'),
      editorReadOnly: { uiEnabled: true, selectionEnabled: false }
    });
    makeModeUI('readonlyUIMode');

    ed.mode.register('readonlySelectionMode', {
      activate: () => console.log('Readonly Selection: Activated'),
      deactivate: () => console.log('Readonly Selection: Deactivated'),
      editorReadOnly: { selectionEnabled: true, uiEnabled: false }
    });
    makeModeUI('readonlySelectionMode');

    makeModeUI('design');
  };

  const makeSidebar = (ed: Editor, name: string, background: string, width: number) => {
    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        console.log('onSetup ' + name);
        const box = SugarElement.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom);
        return () => {
          api.element().removeChild(box.dom);
        };
      },
      onShow: (_api) => {
        console.log('onShow ' + name);
      },
      onHide: (_api) => {
        console.log('onHide ' + name);
      }
    });
  };

  const makeCodeView = (editor: Editor) => {
    editor.ui.registry.addView('code', {
      buttons: [
        {
          type: 'button',
          text: 'Cancel',
          buttonType: 'secondary',
          onAction: () => {
            editor.execCommand('ToggleView', false, 'code');
            console.log('close');
          }
        },
        {
          type: 'button',
          text: 'Save code',
          buttonType: 'primary',
          onAction: () => {
            console.log('save');
          }
        },
      ],
      onShow: (api) => {
        api.getContainer().innerHTML = '<div style="height: 100%"><textarea class="tox-view__pane_panel" style="width: 100%; height: 100%">Hello world!</textarea></div>';
      },
      onHide: (api) => {
        console.log('Deactivate code', api.getContainer());
      }
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
    setup: (ed) => {
      buildModes(ed);
      makeSidebar(ed, 'sidebar1', 'green', 200);
      makeSidebar(ed, 'sidebar2', 'green', 200);
      makeCodeView(ed);
    },
    plugins: [
      'autosave', 'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'importcss', 'codesample', 'help', 'accordion'
    ],
    menubar: 'file edit view tools mode format table help',
    menu: {
      mode: { title: 'Mode', items: 'lock unlock' }
    },
    toolbar_mode: 'sliding',
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'readonlyUIMode readonlySelectionMode design | undo redo sidebar1 fontsizeinput | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl',
    contextmenu: 'link linkchecker image table lists configurepermanentpen',

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
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
    resize_img_proportional: true,
    format_empty_lines: true
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
};
