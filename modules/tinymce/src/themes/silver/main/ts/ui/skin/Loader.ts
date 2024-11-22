import { Fun, Optional, Optionals, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare let tinymce: TinyMCE;

import * as Options from '../../api/Options';
import * as SkinLoaded from './SkinLoaded';

type CSSDecision = {
  readonly _kind: 'load-raw';
  readonly key: string;
  readonly css: string;
} | {
  readonly _kind: 'load-stylesheet';
  readonly url: string;
};

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

const determineCSSDecision = (
  editor: Editor,
  filenameBase: string,
  skinUrl: string = ''
): CSSDecision => {
  const resourceKey = getSkinResourceIdentifier(editor)
    .map((identifier) => skinIdentifierToResourceKey(identifier, `${filenameBase}.css`));
  const resourceValue = resourceKey.bind(getResourceValue);

  return Optionals.lift2(resourceKey, resourceValue, (key, css): CSSDecision => {
    return { _kind: 'load-raw', key, css };
  }).getOrThunk(() => {
    const suffix = editor.editorManager.suffix;
    const skinUiCssUrl = skinUrl + `/${filenameBase}${suffix}.css`;
    return { _kind: 'load-stylesheet', url: skinUiCssUrl };
  });
};

const loadUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const loader = editor.ui.styleSheetLoader;
  const decision = determineCSSDecision(editor, 'skin', skinUrl);
  switch (decision._kind) {
    case 'load-raw':
      const { key, css } = decision;
      loadRawCss(editor, key, css, loader);
      return Promise.resolve();
    case 'load-stylesheet':
      const { url } = decision;
      return loadStylesheet(editor, url, loader);
    default:
      return Promise.resolve();
  }
};

const loadShadowDomUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (!isInShadowRoot) {
    return Promise.resolve();
  } else {
    const loader = DOMUtils.DOM.styleSheetLoader;
    const decision = determineCSSDecision(editor, 'skin.shadowdom', skinUrl);
    switch (decision._kind) {
      case 'load-raw':
        const { key, css } = decision;
        loadRawCss(editor, key, css, loader);
        return Promise.resolve();
      case 'load-stylesheet':
        const { url } = decision;
        return loadStylesheet(editor, url, loader);
      default:
        return Promise.resolve();
    }
  }
};

const loadUiContentCSS = (editor: Editor, isInline: boolean, skinUrl?: string): Promise<void> => {
  const filenameBase = isInline ? 'content.inline' : 'content';
  const decision = determineCSSDecision(editor, filenameBase, skinUrl);
  switch (decision._kind) {
    case 'load-raw':
      const { key, css } = decision;
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
    case 'load-stylesheet':
      const { url } = decision;
      if (skinUrl) {
        editor.contentCSS.push(url);
      }
      return Promise.resolve();
    default:
      return Promise.resolve();
  }
};

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
