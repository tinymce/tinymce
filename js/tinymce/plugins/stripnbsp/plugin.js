/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('stripnbsp', function(editor) {
	editor.on('PostProcess', function(e) {
		if (!e.content) {
			return;
		}

		if (editor.getParam('stripnbsp_force')) {
			e.content = e.content.replace(/&nbsp;/gi, ' ');
		} else {

			e.content = e.content.replace(
				/<([a-z0-9-]+)[^>]*>&nbsp;<\/\1>|(?:\s*&nbsp;){2,}|(?:[^>]\s)?&nbsp;(?:\s[^<])?/gi,
				function(match, tagName) {
					if (tagName) {
						return match;
					}

					if (match !== '&nbsp;') {
						return match;
					}

					return ' ';
				}
			);

		}
	});
});
