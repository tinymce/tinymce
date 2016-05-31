/**
 * SkinLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/SkinLoader', [
	'global!tinymce.EditorManager',
	'global!tinymce.DOM'
], function (EditorManager, DOM) {
	var fireSkinLoaded = function (editor) {
		if (editor.initialized) {
			editor.fire('SkinLoaded');
		} else {
			editor.on('init', function() {
				editor.fire('SkinLoaded');
			});
		}
	};

	var load = function (editor, skin, callback) {
		var baseUrl = EditorManager.baseURL;
		var skinUrl = baseUrl + '/skins/' + skin;

		var done = function () {
			fireSkinLoaded(editor);
			callback();
		};

		DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', done);
		editor.contentCSS.push(skinUrl + '/content.inline.min.css');
	};

	return {
		load: load
	};
});


