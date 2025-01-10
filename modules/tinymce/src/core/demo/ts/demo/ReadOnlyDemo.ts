/* eslint-disable no-console */
import { Fun, Merger } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Editor, RawEditorOptions, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const makeButton = (ed: Editor, name: string, context?: string, onSetup?: (api: any) => (api: any) => void) => {
    ed.ui.registry.addButton(name, {
      text: name,
      context,
      onAction: Fun.noop,
      onSetup
    });
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
      makeButton(ed, 'context-any', 'any');
      makeButton(ed, 'context-mode:design');
      makeButton(ed, 'context-mode:readonly', 'mode:readonly');
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
    toolbar: 'context-any context-mode:design context-mode:readonly',
    contextmenu: 'link linkchecker image table lists configurepermanentpen',
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
    resize_img_proportional: true,
    format_empty_lines: true
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
};
