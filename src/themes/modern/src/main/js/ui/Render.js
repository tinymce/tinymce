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
    'tinymce.core.EditorManager',
    'tinymce.themes.modern.modes.Iframe',
    'tinymce.themes.modern.modes.Inline',
    'tinymce.themes.modern.ui.ProgressState'
  ],
  function (EditorManager, Iframe, Inline, ProgressState) {
    var renderUI = function (editor, theme, args) {
      var settings = editor.settings;
      var skin = settings.skin !== false ? settings.skin || 'lightgray' : false;

      if (skin) {
        var skinUrl = settings.skin_url;

        if (skinUrl) {
          skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
        } else {
          skinUrl = EditorManager.baseURL + '/skins/' + skin;
        }

        args.skinUiCss = skinUrl + '/skin.min.css';

        // Load content.min.css or content.inline.min.css
        editor.contentCSS.push(skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css');
      }

      ProgressState.setup(editor, theme);

      if (settings.inline) {
        return Inline.render(editor, theme, args);
      }

      return Iframe.render(editor, theme, args);
    };

    return {
      renderUI: renderUI
    };
  }
);
