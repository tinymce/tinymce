import { Fun, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare let tinymce: TinyMCE;

import * as Options from '../../api/Options';
import * as SkinLoaded from './SkinLoaded';

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

const loadUiSkins = async (editor: Editor, skinUrl: string): Promise<void> => {
  const skinUrl_ = Options.getSkinUrlOption(editor).getOr('default');
  const skinUiCss = 'ui/' + skinUrl_ + '/skin.css';
  const css = tinymce.Resource.get(skinUiCss);
  if (Type.isString(css)) {
    return Promise.resolve(loadRawCss(editor, skinUiCss, css, editor.ui.styleSheetLoader));
  } else {
    const skinUiCss = skinUrl + '/skin.min.css';
    return loadStylesheet(editor, skinUiCss, editor.ui.styleSheetLoader);
  }
};

const loadShadowDomUiSkins = async (editor: Editor, skinUrl: string): Promise<void> => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (isInShadowRoot) {

    const shadowDomSkinCss = skinUrl + '/skin.shadowdom.css';
    const css = tinymce.Resource.get(shadowDomSkinCss);

    if (Type.isString(css)) {
      loadRawCss(editor, shadowDomSkinCss, css, DOMUtils.DOM.styleSheetLoader);
      return Promise.resolve();
    } else {
      const shadowDomSkinCss = skinUrl + '/skin.shadowdom.min.css';
      return loadStylesheet(editor, shadowDomSkinCss, DOMUtils.DOM.styleSheetLoader);
    }
  }
};

const loadUrlSkin = async (isInline: boolean, editor: Editor): Promise<void> => {
  Options.getSkinUrlOption(editor).fold(() => {
    const skinUrl_ = Options.getSkinUrl(editor);
    if (skinUrl_) {
      editor.contentCSS.push(skinUrl_ + (isInline ? '/content.inline' : '/content') + '.min.css');
    }
  }, (skinUrl) => {
    const skinContentCss = 'ui/' + skinUrl + (isInline ? '/content.inline' : '/content') + '.css';
    const css = tinymce.Resource.get(skinContentCss);
    if (Type.isString(css)) {
      loadRawCss(editor, skinContentCss, css, editor.ui.styleSheetLoader);
    } else {
      const skinUrl_ = Options.getSkinUrl(editor);
      if (skinUrl_) {
        editor.contentCSS.push(skinUrl_ + (isInline ? '/content.inline' : '/content') + '.min.css');
      }
    }
  });

  const skinUrl = Options.getSkinUrl(editor);

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
