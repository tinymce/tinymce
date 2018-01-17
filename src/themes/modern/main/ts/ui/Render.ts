/**
 * Render.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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