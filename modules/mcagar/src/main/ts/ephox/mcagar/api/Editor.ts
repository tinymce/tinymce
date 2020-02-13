import { Global, Id, Strings, Type } from '@ephox/katamari';
import { Attr, Element, Insert, Remove, Selectors } from '@ephox/sugar';
import { Chain } from '@ephox/agar';
import 'tinymce';
import { document, setTimeout } from '@ephox/dom-globals';
import { setTinymceBaseUrl } from '../loader/Urls';
import { Editor as EditorType } from '../alien/EditorTypes';

const cFromElement = function <T extends EditorType = EditorType>(element: Element, settings: Record<string, any>): Chain<any, T> {
  return Chain.async<any, T>(function (_, next, die) {
    const nuSettings: Record<string, any> = {
      toolbar_mode: 'wrap',
      ...settings
    };

    const randomId = Id.generate('tiny-loader');

    Attr.set(element, 'id', randomId);
    Insert.append(Element.fromDom(document.body), element);

    const tinymce = Global.tinymce;

    if (nuSettings.base_url) {
      setTinymceBaseUrl(tinymce, nuSettings.base_url);
    } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
      setTinymceBaseUrl(Global.tinymce, `/project/node_modules/tinymce`);
    }

    tinymce.init({
      ...nuSettings,
      selector: '#' + randomId,
      setup (editor: T) {
        if (Type.isFunction(nuSettings.setup)) {
          nuSettings.setup(editor);
        }
        editor.on('SkinLoaded', function () {
          setTimeout(function () {
            next(editor);
          }, 0);
        });

        editor.on('SkinLoadError', (e) => {
          die(e.message);
        });
      }
    });
  });
};

const cFromHtml = function <T extends EditorType = EditorType> (html: string | null, settings: Record<string, any>): Chain<any, T> {
  const element = html ? Element.fromHtml(html) : Element.fromTag(settings.inline ? 'div' : 'textarea');
  return cFromElement(element, settings);
};

const cFromSettings = function <T extends EditorType = EditorType> (settings: Record<string, any>): Chain<any, T> {
  return cFromHtml(null, settings);
};

const cRemove = Chain.op(function (editor: EditorType) {
  const id = editor.id;
  editor.remove();
  Selectors.one('#' + id).each(Remove.remove);
});

const cCreate = cFromSettings({});
const cCreateInline = cFromSettings({ inline: true });

export {
  cFromHtml,
  cFromElement,
  cFromSettings,
  cCreate,
  cCreateInline,
  cRemove
};
