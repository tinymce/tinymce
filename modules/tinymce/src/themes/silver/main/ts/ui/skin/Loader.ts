import { Fun, Optional, Optionals, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare let tinymce: TinyMCE;

import * as Options from '../../api/Options';
import * as SkinLoaded from './SkinLoaded';

const getSkinResourceIdentifier = (editor: Editor): Optional<string> => {
  const skin = Options.getSkin(editor);
  // Use falsy check to cover false, undefined/null and empty string
  if (!skin) {
    return Optional.none();
  } else {
    return Optional.from(skin);
  }
};

const loadStylesheet = (editor: Editor, stylesheetUrl: string, styleSheetLoader: StyleSheetLoader): Promise<void> => {
  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unload(stylesheetUrl));
  return styleSheetLoader.load(stylesheetUrl);
};

const loadRawCss = (editor: Editor, key: string, css: string, styleSheetLoader: StyleSheetLoader): void => {
  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unloadRawCss(key));
  return styleSheetLoader.loadRawCss(key, css);
};

const skinIdentifierToResourceKey = (identifier: string, filename: string): string =>
  'ui/' + identifier + '/' + filename;

const getResourceValue = (resourceKey: string): Optional<string> =>
  Optional.from(tinymce.Resource.get(resourceKey)).filter(Type.isString);

const loadCSS = (
  editor: Editor,
  filenameBase: string,
  onLoadRaw: (key: string, css: string) => Promise<void>,
  onLoadStyleSheet: (styleSheetUrl: string) => Promise<void>,
  skinUrl: string = ''
) => {
  const resourceKey = getSkinResourceIdentifier(editor)
    .map((identifier) => skinIdentifierToResourceKey(identifier, `${filenameBase}.css`));
  const resourceValue = resourceKey.bind(getResourceValue);

  return Optionals.lift2(resourceKey, resourceValue, (key, css) => {
    return onLoadRaw(key, css);
  }).getOrThunk(() => {
    const suffix = editor.editorManager.suffix;
    const skinUiCssUrl = skinUrl + `/${filenameBase}${suffix}.css`;
    return onLoadStyleSheet(skinUiCssUrl);
  });
};

const loadUiSkins = (editor: Editor, skinUrl: string): Promise<void> =>
  loadCSS(
    editor,
    'skin',
    (key, css) => {
      loadRawCss(editor, key, css, editor.ui.styleSheetLoader);
      return Promise.resolve();
    },
    (url) => {
      return loadStylesheet(editor, url, editor.ui.styleSheetLoader);
    },
    skinUrl
  );

const loadShadowDomUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (!isInShadowRoot) {
    return Promise.resolve();
  } else {
    return loadCSS(
      editor,
      'skin.shadowdom',
      (key, css) => {
        loadRawCss(editor, key, css, DOMUtils.DOM.styleSheetLoader);
        return Promise.resolve();
      },
      (url) => {
        return loadStylesheet(editor, url, DOMUtils.DOM.styleSheetLoader);
      },
      skinUrl
    );

  }
};

const loadUiContentCSS = (editor: Editor, isInline: boolean, skinUrl?: string): Promise<void> =>
  loadCSS(
    editor,
    isInline ? 'content.inline' : 'content',
    (key, css) => {
      if (isInline) {
        loadRawCss(editor, key, css, editor.ui.styleSheetLoader);
      } else {
        // Need to wait until the iframe is in the DOM before trying to load
        // the style into the iframe document
        editor.on('PostRender', () => {
          loadRawCss(editor, key, css, editor.dom.styleSheetLoader);
        });
      }
      return Promise.resolve();
    },
    (url) => {
      if (skinUrl) {
        editor.contentCSS.push(url);
      }
      return Promise.resolve();
    },
    skinUrl
  );

const loadUrlSkin = async (isInline: boolean, editor: Editor): Promise<void> => {
  const skinUrl = Options.getSkinUrl(editor);

  await loadUiContentCSS(editor, isInline, skinUrl);

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (!Options.isSkinDisabled(editor) && Type.isString(skinUrl)) {
    return Promise.all([
      loadUiSkins(editor, skinUrl),
      loadShadowDomUiSkins(editor, skinUrl)
    ]).then();
  }
};

const loadSkin = (isInline: boolean, editor: Editor): Promise<void> => {
  return loadUrlSkin(isInline, editor).then(SkinLoaded.fireSkinLoaded(editor), SkinLoaded.fireSkinLoadError(editor, 'Skin could not be loaded'));
};

const iframe = Fun.curry(loadSkin, false);
const inline = Fun.curry(loadSkin, true);

export {
  iframe,
  inline
};
