/**
 * Theme.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce.modern.Theme', [
	'global!tinymce.Env',
	'global!tinymce.EditorManager',
	'global!tinymce.ThemeManager',
	'tinymce.modern.modes.Iframe',
	'tinymce.modern.modes.Inline',
	'tinymce.modern.ui.Resize',
	'tinymce.modern.ui.ProgressState'
], function (Env, EditorManager, ThemeManager, Iframe, Inline, Resize, ProgressState) {
	var renderUI = function(editor, theme, args) {
		var settings = editor.settings;
		var skin = settings.skin !== false ? settings.skin || 'lightgray' : false;

		if (skin) {
			var skinUrl = settings.skin_url;

			if (skinUrl) {
				skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
			} else {
				skinUrl = EditorManager.baseURL + '/skins/' + skin;
			}

			// Load special skin for IE7
			// TODO: Remove this when we drop IE7 support
			if (Env.documentMode <= 7) {
				args.skinUiCss = skinUrl + '/skin.ie7.min.css';
			} else {
				args.skinUiCss = skinUrl + '/skin.min.css';
			}

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
});
