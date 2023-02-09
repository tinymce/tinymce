import { Fun, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import * as SkinLoaded from './SkinLoaded';

const loadStylesheet = (editor: Editor, stylesheetUrl: string, styleSheetLoader: StyleSheetLoader): Promise<void> => {
  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unload(stylesheetUrl));
  return styleSheetLoader.load(stylesheetUrl);
};

const loadUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const skinUiCss = skinUrl + '/skin.min.css';
  return loadStylesheet(editor, skinUiCss, editor.ui.styleSheetLoader);
};

const loadShadowDomUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (isInShadowRoot) {
    const shadowDomSkinCss = skinUrl + '/skin.shadowdom.min.css';
    return loadStylesheet(editor, shadowDomSkinCss, DOMUtils.DOM.styleSheetLoader);
  } else {
    return Promise.resolve();
  }
};

const loadSkin = (isInline: boolean, editor: Editor): Promise<void> => {
  const skinUrl = Options.getSkinUrl(editor);

  if (skinUrl) {
    editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (!Options.isSkinDisabled(editor) && Type.isString(skinUrl)) {
    return Promise.all([
      loadUiSkins(editor, skinUrl),
      loadShadowDomUiSkins(editor, skinUrl)
    ]).then(SkinLoaded.fireSkinLoaded(editor), SkinLoaded.fireSkinLoadError(editor, 'Skin could not be loaded'));
  } else {
    return Promise.resolve(SkinLoaded.fireSkinLoaded(editor)());
  }
};

const iframe = Fun.curry(loadSkin, false);
const inline = Fun.curry(loadSkin, true);

export {
  iframe,
  inline
};
