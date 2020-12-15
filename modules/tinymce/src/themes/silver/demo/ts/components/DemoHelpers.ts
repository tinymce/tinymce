import { Attachment, Behaviour, Channels, Debugging, DomFactory, Gui, GuiFactory, Positioning } from '@ephox/alloy';
import { Fun, Future, Id, Optional, Result } from '@ephox/katamari';
import { Class, SugarBody } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { ApiUrlData, LinkInformation, UrlValidationHandler } from 'tinymce/themes/silver/backstage/UrlInputBackstage';

const setupDemo = () => {

  const oldSink = document.querySelectorAll('.mce-silver-sink');
  if (oldSink.length > 0) {
    throw Error('old sinks found, a previous demo did not call helpers.destroy() leaving artifacts, found: ' + oldSink.length);
  }

  // begin of demo helpers
  const sink = GuiFactory.build({
    dom: DomFactory.fromHtml('<div class="mce-silver-sink"></div>'),
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: Fun.always
      })
    ])
  });

  const uiMothership = Gui.create();
  Class.add(uiMothership.element, 'tox');

  const fakeHistory = (fileType: string): string[] => {
    if (fileType === 'image') {
      return [ 'https://i.stack.imgur.com/8JoS3.png' ];
    } else if (fileType === 'media') {
      return [];
    } else if (fileType === 'file') {
      return [ 'https://www.tiny.cloud/' ];
    }
    return [];
  };

  const fakeLinkInfo: LinkInformation = {
    targets: [
      { type: 'anchor', title: 'Google', url: 'http://www.google.com.au', level: 0, attach: Fun.noop },
      { type: 'header', title: 'Header', url: '#header', level: 1, attach: () => {
        // eslint-disable-next-line no-console
        console.log('This is where the ID would be attached to the header so it can be linked');
      } }
    ],
    anchorTop: '#top',
    anchorBottom: '#bottom'
  };

  const fakeValidator: UrlValidationHandler = (info, callback) => {
    if (info.url === 'test-valid' || /^https?:\/\/www\.google\.com\/google\.jpg$/.test(info.url)) {
      callback({ message: `Yep, that's valid...`, status: 'valid' });
    } else if (info.url === 'test-unknown' || /\.(?:jpg|png|gif)$/.test(info.url)) {
      callback({ message: `Hmm, I don't know...`, status: 'unknown' });
    } else if (info.url === 'test-invalid') {
      callback({ message: `No, no, definitly not, just don't, STOP...`, status: 'invalid' });
    } else {
      callback({ message: '', status: 'none' });
    }
  };

  const choiceItem: 'choiceitem' = 'choiceitem';

  // This is fake because ColorInputBackstage requires Editor constructor
  const fakecolorinputBackstage = {
    colorPicker: Fun.noop,
    hasCustomColors: Fun.never,
    getColors: () => [
      { type: choiceItem, text: 'Turquoise', value: '#18BC9B' },
      { type: choiceItem, text: 'Green', value: '#2FCC71' },
      { type: choiceItem, text: 'Blue', value: '#3598DB' },
      { type: choiceItem, text: 'Purple', value: '#9B59B6' },
      { type: choiceItem, text: 'Navy Blue', value: '#34495E' },

      { type: choiceItem, text: 'Dark Turquoise', value: '#18A085' },
      { type: choiceItem, text: 'Dark Green', value: '#27AE60' },
      { type: choiceItem, text: 'Medium Blue', value: '#2880B9' },
      { type: choiceItem, text: 'Medium Purple', value: '#8E44AD' },
      { type: choiceItem, text: 'Midnight Blue', value: '#2B3E50' },

      { type: choiceItem, text: 'Yellow', value: '#F1C40F' },
      { type: choiceItem, text: 'Orange', value: '#E67E23' },
      { type: choiceItem, text: 'Red', value: '#E74C3C' },
      { type: choiceItem, text: 'Light Gray', value: '#ECF0F1' },
      { type: choiceItem, text: 'Gray', value: '#95A5A6' },

      { type: choiceItem, text: 'Dark Yellow', value: '#F29D12' },
      { type: choiceItem, text: 'Dark Orange', value: '#D35400' },
      { type: choiceItem, text: 'Dark Red', value: '#E74C3C' },
      { type: choiceItem, text: 'Medium Gray', value: '#BDC3C7' },
      { type: choiceItem, text: 'Dark Gray', value: '#7E8C8D' },

      { type: choiceItem, text: 'Black', value: '#000000' },
      { type: choiceItem, text: 'White', value: '#ffffff' }
    ],
    getColorCols: Fun.constant(5)
  };

  const backstage: UiFactoryBackstage = {
    shared: {
      providers: {
        icons: (): Record<string, any> => ({}),
        menuItems: (): Record<string, any> => ({}),
        translate: I18n.translate,
        isDisabled: Fun.never,
        getSetting: (_settingName: string, defaultVal: any) => defaultVal
      },
      interpreter: (x) => x,
      getSink: () => Result.value(sink),
      anchors: {
        inlineDialog: () =>
          // NOTE: Non-sensical
          ({
            anchor: 'hotspot',
            hotspot: sink
          }),
        banner: () =>
          // NOTE: Non-sensical
          ({
            anchor: 'hotspot',
            hotspot: sink
          }),
        cursor: () =>
          // NOTE: Non-sensical
          ({
            anchor: 'selection',
            root: SugarBody.body()
          }),
        node: (elem) =>
          // NOTE: Non-sensical
          ({
            anchor: 'node',
            root: SugarBody.body(),
            node: elem
          })
      }
    },
    colorinput: fakecolorinputBackstage,
    urlinput: {
      getHistory: fakeHistory,
      addToHistory: (_url: string, _fileType: string) => {},
      getLinkInformation: () => Optional.some(fakeLinkInfo),
      getValidationHandler: () => Optional.some(fakeValidator),
      getUrlPicker: (_filetype) => Optional.some((entry: ApiUrlData) => {
        const newUrl = Optional.from(window.prompt('File browser would show instead of this...', entry.value));
        return Future.pure({ ...entry, value: newUrl.getOr(entry.value) });
      })
    }
    // styleselect: StyleFormatsBackstage.init({
    //   on: (name, f) => {
    //     if (name === 'addStyleModifications') {
    //       f({ items: [ ] });
    //     } else {
    //       f();
    //     }
    //   },
    //   settings: {
    //     style_formats: [
    //       { title: 'h1', block: 'h1', styles: { } }
    //     ]
    //   },
    //   formatter: (() => {
    //     const formats = {
    //       h1: {
    //         title: 'h1',
    //         block: 'h1',
    //         styles: { }
    //       },
    //       h2: {
    //         title: 'h2',
    //         block: 'h2',
    //         styles: { }
    //       },
    //       h3: {
    //         title: 'h3',
    //         block: 'h3',
    //         styles: { }
    //       },
    //       h4: {
    //         title: 'h4',
    //         block: 'h4',
    //         styles: { }
    //       },
    //       h5: {
    //         title: 'h5',
    //         block: 'h5',
    //         styles: { }
    //       },
    //       h6: {
    //         title: 'h6',
    //         block: 'h6',
    //         styles: { }
    //       },
    //       bold: {
    //         title: 'bold',
    //         inline: 'span',
    //         styles: { 'font-weight': 'bold' }
    //       }
    //     };

    //     const register = (name, f) => {
    //       console.log('registering', name, f);
    //       formats[f.format] = f;
    //     };

    //     const get = (n) => {
    //       return formats[n];
    //     };

    //     return {
    //       register,
    //       canApply: () => true,
    //       get,
    //       getCssText: (name) => {
    //         const span = SugarElement.fromTag('span');
    //         Css.setAll(span, formats[name].styles || { });
    //         console.log('span', span.dom);
    //         return Attribute.get(span, 'style') || '';
    //       }
    //     };
    //   })()
    // } as any)
  };

  const mockEditor = {
    setContent: (_content) => {},
    insertContent: (_content: string, _args?: any) => {},
    execCommand: (_cmd: string, _ui?: boolean, _value?: any) => {}
  } as Editor;

  const extras = {
    editor: mockEditor,
    backstage
  };

  uiMothership.add(sink);
  Attachment.attachSystem(SugarBody.body(), uiMothership);

  const destroy = () => {
    uiMothership.remove(sink);
    uiMothership.destroy();
  };

  Debugging.registerInspector(Id.generate('mothership'), uiMothership);

  // Let the dialog components demo know that the mouse has been released.
  document.addEventListener('mouseup', () => {
    uiMothership.broadcastOn([ Channels.mouseReleased() ], { });
  });

  // end of demo helpers

  return {
    uiMothership,
    sink,
    extras,
    destroy
  };
};

export { setupDemo };
