/**
 * SkinLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlite/core/SkinLoader', [
	'global!tinymce.EditorManager',
	'global!tinymce.DOM'
], function (EditorManager, DOM) {
	var fireSkinLoaded = function (editor, callback) {
		var done = function () {
			editor._skinLoaded = true;
			editor.fire('SkinLoaded');
			callback();
		};

		if (editor.initialized) {
			done();
		} else {
			editor.on('init', done);
		}
	};

	var urlFromName = function (name) {
		var prefix = EditorManager.baseURL + '/skins/';
		return name ? prefix + name : prefix + 'lightgray';
	};

	var toAbsoluteUrl = function (editor, url) {
		return editor.documentBaseURI.toAbsolute(url);
	};

	var load = function (editor, callback) {
		var settings = editor.settings;
		var skinUrl = settings.skin_url ? toAbsoluteUrl(editor, settings.skin_url) : urlFromName(settings.skin);

		var done = function () {
			fireSkinLoaded(editor, callback);
		};

		DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', done);
		editor.contentCSS.push(skinUrl + '/content.inline.min.css');
	};

	return {
		load: load
	};
});


