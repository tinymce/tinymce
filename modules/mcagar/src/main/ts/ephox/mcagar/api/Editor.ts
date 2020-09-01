import { Chain } from '@ephox/agar';
import { Global, Id, Strings, Type } from '@ephox/katamari';
import { Attribute, Insert, Remove, Selectors, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
import 'tinymce';
import { Editor as EditorType } from '../alien/EditorTypes';
import { setTinymceBaseUrl } from '../loader/Urls';

const pFromElement = <T extends EditorType = EditorType> (element: SugarElement, settings: Record<string, any>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const nuSettings: Record<string, any> = {
      toolbar_mode: 'wrap',
      ...settings
    };

    const randomId = Id.generate('tiny-loader');

    Attribute.set(element, 'id', randomId);
    if (!SugarBody.inBody(element)) {
      Insert.append(SugarBody.body(), element);
    }

    const tinymce = Global.tinymce;

    if (nuSettings.base_url) {
      setTinymceBaseUrl(tinymce, nuSettings.base_url);
    } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
      setTinymceBaseUrl(Global.tinymce, '/project/node_modules/tinymce');
    }

    const targetSettings = SugarShadowDom.isInShadowRoot(element) ? ({ target: element.dom }) : ({ selector: '#' + randomId });

    tinymce.init({
      ...nuSettings,
      ...targetSettings,
      setup(editor: T) {
        if (Type.isFunction(nuSettings.setup)) {
          nuSettings.setup(editor);
        }
        editor.on('SkinLoaded', function () {
          setTimeout(function () {
            resolve(editor);
          }, 0);
        });

        editor.on('SkinLoadError', (e) => {
          reject(e.message);
        });
      }
    });
  });

const cFromElement = <T extends EditorType = EditorType>(element: SugarElement, settings: Record<string, any>): Chain<any, T> =>
  Chain.fromPromise(() => pFromElement(element, settings));

const pFromHtml = <T extends EditorType = EditorType>(html: string | null, settings: Record<string, any>): Promise<T> => {
  const element = html ? SugarElement.fromHtml(html) : SugarElement.fromTag(settings.inline ? 'div' : 'textarea');
  return pFromElement(element, settings);
};

const cFromHtml = <T extends EditorType = EditorType>(html: string | null, settings: Record<string, any>): Chain<any, T> =>
  Chain.fromPromise(() => pFromHtml(html, settings));

const pFromSettings = <T extends EditorType = EditorType>(settings: Record<string, any>): Promise<T> =>
  pFromHtml(null, settings);

const cFromSettings = <T extends EditorType = EditorType>(settings: Record<string, any>): Chain<any, T> =>
  cFromHtml(null, settings);

const remove = (editor: EditorType): void => {
  const id = editor.id;
  editor.remove();
  Selectors.one('#' + id).each(Remove.remove);
};

const cRemove = Chain.op((editor: EditorType) => {
  remove(editor);
});

const pCreate = <T extends EditorType = EditorType> (): Promise<T> =>
  pFromSettings<T>({});

const pCreateInline = <T extends EditorType = EditorType> (): Promise<T> =>
  pFromSettings({ inline: true });

const cCreate = cFromSettings({});
const cCreateInline = cFromSettings({ inline: true });

export {
  pFromHtml,
  pFromElement,
  pFromSettings,
  pCreate,
  pCreateInline,
  remove,

  cFromHtml,
  cFromElement,
  cFromSettings,
  cCreate,
  cCreateInline,
  cRemove
};
