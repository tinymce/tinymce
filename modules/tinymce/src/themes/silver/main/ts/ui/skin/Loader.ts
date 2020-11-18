/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { StyleSheetLoader } from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import { getSkinUrl, isSkinDisabled } from '../../api/Settings';
import * as SkinLoaded from './SkinLoaded';

const loadStylesheet = (editor: Editor, stylesheetUrl: string, styleSheetLoader: StyleSheetLoader): Promise<void> => new Promise((resolve, reject) => {
  styleSheetLoader.load(stylesheetUrl, resolve, reject);

  // Ensure the stylesheet is cleaned up when the editor is destroyed
  editor.on('remove', () => styleSheetLoader.unload(stylesheetUrl));
});

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

const loadSkin = (isInline: boolean, editor: Editor) => {
  const skinUrl = getSkinUrl(editor);

  if (skinUrl) {
    editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (isSkinDisabled(editor) === false && Type.isString(skinUrl)) {
    Promise.all([
      loadUiSkins(editor, skinUrl),
      loadShadowDomUiSkins(editor, skinUrl)
    ]).then(SkinLoaded.fireSkinLoaded(editor), SkinLoaded.fireSkinLoadError(editor, 'Skin could not be loaded'));
  } else {
    SkinLoaded.fireSkinLoaded(editor)();
  }
};

const iframe = Fun.curry(loadSkin, false);
const inline = Fun.curry(loadSkin, true);

export {
  iframe,
  inline
};
