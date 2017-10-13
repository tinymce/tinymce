/**
 * Render.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.ui.Render',
  [
    'tinymce.themes.modern.api.Settings',
    'tinymce.themes.modern.modes.Iframe',
    'tinymce.themes.modern.modes.Inline',
    'tinymce.themes.modern.ui.ProgressState'
  ],
  function (Settings, Iframe, Inline, ProgressState) {
    var renderUI = function (editor, theme, args) {
      var skinUrl = Settings.getSkinUrl(editor);

      if (skinUrl) {
        args.skinUiCss = skinUrl + '/skin.min.css';
        editor.contentCSS.push(skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css');
      }

      ProgressState.setup(editor, theme);

      return Settings.isInline(editor) ? Inline.render(editor, theme, args) : Iframe.render(editor, theme, args);
    };

    return {
      renderUI: renderUI
    };
  }
);
