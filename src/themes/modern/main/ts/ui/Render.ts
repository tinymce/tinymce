/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Settings from '../api/Settings';
import Iframe from '../modes/Iframe';
import Inline from '../modes/Inline';
import ProgressState from './ProgressState';

const renderUI = function (editor, theme, args) {
  const skinUrl = Settings.getSkinUrl(editor);

  if (skinUrl) {
    args.skinUiCss = skinUrl + '/skin.min.css';
    editor.contentCSS.push(skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css');
  }

  ProgressState.setup(editor, theme);

  return Settings.isInline(editor) ? Inline.render(editor, theme, args) : Iframe.render(editor, theme, args);
};

export default {
  renderUI
};