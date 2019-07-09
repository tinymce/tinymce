import { Global, Id, Merger, Strings, Type } from '@ephox/katamari';
import { Attr, Element, Insert, Remove, Selectors } from '@ephox/sugar';
import { Chain } from '@ephox/agar';
import 'tinymce';
import { document, setTimeout } from '@ephox/dom-globals';
import { setTinymceBaseUrl } from '../loader/Urls';

const cFromElement = function (element, settings: Record<string, any>) {
  return Chain.async(function (_, next, die) {
    const randomId = Id.generate('tiny-loader');

    Attr.set(element, 'id', randomId);
    Insert.append(Element.fromDom(document.body), element);

    const tinymce = Global.tinymce;

    if (settings.base_url) {
      setTinymceBaseUrl(tinymce, settings.base_url);
    } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
      setTinymceBaseUrl(Global.tinymce, `/project/node_modules/tinymce`);
    }

    tinymce.init(Merger.merge(settings, {
      selector: '#' + randomId,
      setup (editor) {
        if (Type.isFunction(settings.setup)) {
          settings.setup(editor);
        }
        editor.on('SkinLoaded', function () {
          setTimeout(function () {
            next(editor);
          }, 0);
        });
      }
    }));
  });
};

const cFromHtml = function (html: string, settings: Record<string, any>) {
  const element = html ? Element.fromHtml(html) : Element.fromTag(settings.inline ? 'div' : 'textarea');
  return cFromElement(element, settings);
};

const cFromSettings = function (settings: Record<string, any>) {
  return cFromHtml(null, settings);
};

const cRemove = Chain.op(function (editor: any) {
  const id = editor.id;
  editor.remove();
  Selectors.one('#' + id).each(Remove.remove);
});

export default {
  cFromHtml,
  cFromElement,
  cFromSettings,
  cCreate: cFromSettings({}),
  cCreateInline: cFromSettings({ inline: true }),
  cRemove
};
