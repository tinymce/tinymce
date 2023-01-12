/* eslint-disable no-console */

import { Fun } from '@ephox/katamari';
import { Css, DomEvent, Insert, SugarBody, SugarElement, TextContent } from '@ephox/sugar';

import { Editor, RawEditorOptions, StyleSheetLoader, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
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
    selector: '.tinymcex',
    semi: true,
    inline: true,
    quickbars_insert_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    quickbars_selection_toolbar: 'bold italic | h2 h3 | blockquote quicklink',
    // content_css: '../../../../js/tinymce/skins/content/default/content.css',
    images_upload_url: 'd',
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
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
    ],
    plugins: [
      'autosave', 'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'template', 'importcss', 'codesample', 'help', 'quickbars'
    ],
    toolbar: 'undo redo sidebar1 | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl',
    setup: (ed) => {
      ed.on('preinit', () => {
        console.time();
      });

      ed.on('init', () => {
        console.timeEnd();
      });

      makeSidebar(ed, 'sidebar1', 'green', 200);
      makeSidebar(ed, 'sidebar2', 'green', 200);
      makeCodeView(ed);
    }
  };

  const init = () => {
    tinymce.init(settings);
  };

  const makeButton = (title: string, action: () => void) => {
    const button = SugarElement.fromTag('button');
    TextContent.set(button, title);
    DomEvent.bind(button, 'click', () => {
      action();
    });

    Insert.prepend(SugarBody.body(), button);
  };

  makeButton('Move editor above me', () => {
    const elm = tinymce.activeEditor?.getContainer();
    if (elm) {
      Insert.prepend(SugarBody.body(), SugarElement.fromDom(elm));
    }
  });

  makeButton('Style body', () => {
    Css.set(SugarBody.body(), 'color', 'red');
  });

  makeButton('Reinit', () => {
    tinymce.remove();
    init();
  });

  // Prevent stylesheets from being unloaded to reduce flicker in DIV mode
  tinymce.DOM.styleSheetLoader.unload = Fun.noop;
  tinymce.DOM.styleSheetLoader.unloadAll = Fun.noop;

  init();
};
