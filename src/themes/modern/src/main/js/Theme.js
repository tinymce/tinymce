/**
 * Theme.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.Theme',
  [
    'global!window',
    'tinymce.core.AddOnManager',
    'tinymce.core.EditorManager',
    'tinymce.core.Env',
    'tinymce.core.ui.Api',
    'tinymce.themes.modern.modes.Iframe',
    'tinymce.themes.modern.modes.Inline',
    'tinymce.themes.modern.ui.ProgressState',
    'tinymce.themes.modern.ui.Resize'
  ],
  function (window, AddOnManager, EditorManager, Env, Api, Iframe, Inline, ProgressState, Resize) {
    var ThemeManager = AddOnManager.ThemeManager;

    Api.appendTo(window.tinymce ? window.tinymce : {});

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

    ThemeManager.add('modern', function (editor) {
      return {
        renderUI: function (args) {
          return renderUI(editor, this, args);
        },
        resizeTo: function (w, h) {
          return Resize.resizeTo(editor, w, h);
        },
        resizeBy: function (dw, dh) {
          return Resize.resizeBy(editor, dw, dh);
        }
      };
    });

    return function () {
    };
  }
);
