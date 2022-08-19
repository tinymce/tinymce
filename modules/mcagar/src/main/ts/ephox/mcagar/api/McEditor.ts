import { Chain } from '@ephox/agar';
import { Global, Id, Type } from '@ephox/katamari';
import { Attribute, Insert, Remove, Selectors, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';

import { Editor as EditorType } from '../alien/EditorTypes';
import { loadScript } from '../loader/Loader';
import { detectTinymceBaseUrl, setupTinymceBaseUrl } from '../loader/Urls';

const errorMessageEditorRemoved = 'Editor Removed';

const pFromElement = <T extends EditorType = EditorType>(element: SugarElement<Element>, settings: Record<string, any>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const nuSettings: Record<string, any> = {
      toolbar_mode: 'wrap',
      promotion: false,
      ...settings
    };

    const randomId = Id.generate('tiny-loader');

    Attribute.set(element, 'id', randomId);
    if (!SugarBody.inBody(element)) {
      Insert.append(SugarBody.body(), element);
    }

    const run = () => {
      const tinymce = Global.tinymce;
      setupTinymceBaseUrl(tinymce, nuSettings);

      const targetSettings = SugarShadowDom.isInShadowRoot(element) ? ({ target: element.dom }) : ({ selector: '#' + randomId });

      tinymce.init({
        ...nuSettings,
        ...targetSettings,
        setup: (editor: T) => {
          if (Type.isFunction(nuSettings.setup)) {
            nuSettings.setup(editor);
          }
          const onRemove = () => {
            Selectors.one('#' + randomId).each(Remove.remove);
            reject(errorMessageEditorRemoved);
          };
          editor.once('remove', onRemove);

          editor.once('SkinLoaded', () => {
            editor.off('remove', onRemove);
            setTimeout(() => {
              resolve(editor);
            }, 0);
          });

          editor.once('SkinLoadError', (e) => {
            editor.off('remove', onRemove);
            reject(e.message);
          });
        }
      });
    };

    if (!Global.tinymce) {
      // Attempt to load TinyMCE if it's not available
      loadScript(detectTinymceBaseUrl(settings) + '/tinymce.js').get((result) => {
        result.fold(() => reject('Failed to find a global tinymce instance'), run);
      });
    } else {
      run();
    }
  });
};

const pFromHtml = <T extends EditorType = EditorType>(html: string | null | undefined, settings: Record<string, any>): Promise<T> => {
  const element = html ? SugarElement.fromHtml<Element>(html) : SugarElement.fromTag(settings.inline ? 'div' : 'textarea');
  return pFromElement(element, settings);
};

const pFromSettings = <T extends EditorType = EditorType>(settings: Record<string, any>): Promise<T> => {
  return pFromHtml<T>(null, settings);
};

const cFromElement = <T extends EditorType = EditorType>(element: SugarElement<Element>, settings: Record<string, any>): Chain<unknown, T> => {
  return Chain.fromPromise(() => pFromElement(element, settings));
};

const cFromHtml = <T extends EditorType = EditorType>(html: string | null, settings: Record<string, any>): Chain<any, T> => {
  return Chain.fromPromise(() => pFromHtml(html, settings));
};

const cFromSettings = <T extends EditorType = EditorType>(settings: Record<string, any>): Chain<any, T> => {
  return cFromHtml(null, settings);
};

const remove = (editor: EditorType): void => {
  const id = editor.id;
  editor.remove();
  Selectors.one('#' + id).each(Remove.remove);
};

const cRemove = Chain.op(remove);

const cCreate = cFromSettings({});
const cCreateInline = cFromSettings({ inline: true });

const pCreate = <T extends EditorType = EditorType> (): Promise<T> => pFromSettings({});
const pCreateInline = <T extends EditorType = EditorType> (): Promise<T> => pFromSettings({ inline: true });

export {
  errorMessageEditorRemoved,
  cFromHtml,
  cFromElement,
  cFromSettings,
  cCreate,
  cCreateInline,
  cRemove,
  pFromElement,
  pFromHtml,
  pFromSettings,
  pCreate,
  pCreateInline,
  remove
};
