import { Fun, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

import * as Options from '../../api/Options';
import * as SkinLoaded from './SkinLoaded';

const loadStylesheet = (editor: Editor, stylesheetUrl: string, styleSheetLoader: StyleSheetLoader): Promise<void> => {
  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unload(stylesheetUrl));
  return styleSheetLoader.load(stylesheetUrl);
};

const loadUrlUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const skinUiCss = skinUrl + '/skin.min.css';
  return loadStylesheet(editor, skinUiCss, editor.ui.styleSheetLoader);
};

const loadShadowDomUrlUiSkins = (editor: Editor, skinUrl: string): Promise<void> => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (isInShadowRoot) {
    const shadowDomSkinCss = skinUrl + '/skin.shadowdom.min.css';
    return loadStylesheet(editor, shadowDomSkinCss, DOMUtils.DOM.styleSheetLoader);
  } else {
    return Promise.resolve();
  }
};

const loadUrlSkin = (isInline: boolean, editor: Editor): Promise<void | [void, void]> => {
  const skinUrl = Options.getSkinUrl(editor);
  if (skinUrl) {
    editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (!Options.isSkinDisabled(editor) && Type.isString(skinUrl)) {
    return Promise.all([
      loadUrlUiSkins(editor, skinUrl),
      loadShadowDomUrlUiSkins(editor, skinUrl)
    ]);
  } else {
    return Promise.resolve();
  }
};

const loadRawCss = (editor: Editor, key: string, css: string, styleSheetLoader: StyleSheetLoader): void => {
  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unloadRawCss(key));
  return styleSheetLoader.loadRawCss(key, css);
};

const loadRawUiSkins = (editor: Editor, skinKey: string): void => {
  const skinUiCss = skinKey + '/skin.css';
  const css = EditorManager.resources.get(skinUiCss);

  if (Type.isString(css)) {
    return loadRawCss(editor, skinUiCss, css, editor.ui.styleSheetLoader);
  }
};

const loadShadowDomRawUiSkins = (editor: Editor, skinKey: string): void => {
  const isInShadowRoot = SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()));
  if (isInShadowRoot) {
    const shadowDomSkinCss = skinKey + '/skin.shadowdom.css';
    const css = EditorManager.resources.get(shadowDomSkinCss);

    if (Type.isString(css)) {
      return loadRawCss(editor, shadowDomSkinCss, css, DOMUtils.DOM.styleSheetLoader);
    }
  }
};

const loadKeySkin = (isInline: boolean, editor: Editor): Promise<void | [void, void]> => {
  const skinKey = Options.getSkinKey(editor);

  if (skinKey) {
    // eslint-disable-next-line no-debugger
    debugger;
    const css = EditorManager.resources.get(skinKey + (isInline ? '/content.inline' : '/content') + '.css');

    if (Type.isString(css)) {
      loadRawCss(editor, skinKey, css, editor.ui.styleSheetLoader);
    }
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (!Options.isSkinDisabled(editor) && Type.isString(skinKey)) {
    loadRawUiSkins(editor, skinKey);
    loadShadowDomRawUiSkins(editor, skinKey);
  }

  return Promise.resolve();
};

const loadSkin = (isInline: boolean, editor: Editor): Promise<void> => {
  return Promise.all([
    loadUrlSkin(isInline, editor),
    loadKeySkin(isInline, editor)
  ]).then(SkinLoaded.fireSkinLoaded(editor), SkinLoaded.fireSkinLoadError(editor, 'Skin could not be loaded'));
};

const iframe = Fun.curry(loadSkin, false);
const inline = Fun.curry(loadSkin, true);

export {
  iframe,
  inline
};
