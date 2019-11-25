/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';
import { Merger, Singleton } from '@ephox/katamari';
import { Css, Element, Insert, Location, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

declare let tinymce: any;

const syncCommentPos = (ed: Editor, comment: Element, selector: string) => {
  SelectorFind.descendant(Element.fromDom(ed.getBody()), selector).fold(
    () => {
      Css.set(comment, 'display', 'none');
    },
    (element) => {
      Css.remove(comment, 'display');
      const loc = Location.absolute(element);
      Css.set(comment, 'top', loc.top() + 'px');
    }
  );
};

const setupPositioning = (ed: Editor, box: Element, comment: Element) => {
  const updateHeight = () => {
    const height = Math.max(ed.getBody().offsetHeight, ed.getContentAreaContainer().offsetHeight);
    Css.set(box, 'height', height + 'px');
  };

  const updatePos = () => {
    Css.set(box, 'top', '-' + ed.getWin().pageYOffset + 'px');
    syncCommentPos(ed, comment, '#second');
  };

  // Set initial height/position
  updateHeight();
  updatePos();

  // Update pos/height as required
  ed.on('ResizeContent NodeChange', updateHeight);
  ed.on('ScrollContent NodeChange', updatePos);

  return () => {
    ed.off('ResizeContent NodeChange', updateHeight);
    ed.off('ScrollContent NodeChange', updatePos);
  };
};

export default function () {

  const makeSidebar = (ed: Editor, name: string, background: string, width: number) => {
    const unbinder = Singleton.unbindable();
    const box = Element.fromHtml('<div style="position: absolute; top: 0; left: 0; width: 100%; overflow-y: hidden;"></div>');
    const comment = Element.fromHtml('<div style="position: absolute; height: 50px; width: 100%; background: blue; color: white">Comment 1</div>');

    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        console.log('onSetup ' + name);
        const wrapper = Element.fromHtml('<div style="position: relative; width: ' + width + 'px; background: ' + background + ';"></div>');
        Insert.append(wrapper, box);
        Insert.append(box, comment);
        api.element().appendChild(wrapper.dom());
        return () => {
          unbinder.clear();
          api.element().removeChild(wrapper.dom());
        };
      },
      onShow: (api) => {
        const unbindPos = setupPositioning(ed, box, comment);
        unbinder.set({ unbind: unbindPos });
        console.log('onShow ' + name);
      },
      onHide: (api) => {
        unbinder.clear();
        console.log('onHide ' + name);
      },
    });
  };

  const settings = {
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
    image_advtab: true,
    file_picker_callback (callback, value, meta) {
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
      'save table directionality emoticons template paste textcolor importcss colorpicker textpattern',
      'codesample help noneditable print'
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'undo redo sidebar1 align fontsizeselect fontselect formatselect styleselect insertfile | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl',

    // Multiple toolbar array
    // toolbar: ['undo redo sidebar1 align fontsizeselect insertfile | fontselect formatselect styleselect insertfile | styleselect | bold italic',
    // 'alignleft aligncenter alignright alignjustify | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl',
    // 'bullist numlist outdent indent | link image'],

    // Toolbar<n>
    // toolbar1: 'undo redo sidebar1 align fontsizeselect insertfile | fontselect formatselect styleselect insertfile | styleselect | bold italic',
    // toolbar2: 'alignleft aligncenter alignright alignjustify | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl',
    // toolbar3: 'bullist numlist outdent indent | link image',

    // Toolbar with group names
    // toolbar: [
    //   {
    //     name: 'history', items: [ 'undo', 'redo' ]
    //   },
    //   {
    //     name: 'styles', items: [ 'styleselect' ]
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
    toolbar_drawer: 'floating',
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
    resize_img_proportional: true
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
}
