/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { getSkinUrl, isSkinDisabled } from '../../api/Settings';
import Editor from 'tinymce/core/api/Editor';
import * as SkinLoaded from './SkinLoaded';
import { Fun } from '@ephox/katamari';

const loadSkin = (isInline: boolean, editor: Editor) => {
  const skinUrl = getSkinUrl(editor);
  let skinUiCss;

  if (skinUrl) {
    skinUiCss = skinUrl + '/skin.min.css';
    editor.contentCSS.push(skinUrl + (isInline ? '/content.inline' : '/content') + '.min.css');
  }

  // In Modern Inline, this is explicitly called in editor.on('focus', ...) as well as in render().
  // Seems to work without, but adding a note in case things break later
  if (isSkinDisabled(editor) === false && skinUiCss) {
    editor.ui.styleSheetLoader.load(skinUiCss, SkinLoaded.fireSkinLoaded(editor), SkinLoaded.fireSkinLoadError(editor, 'Skin could not be loaded'));
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
