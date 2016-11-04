/**
 * SkinLoaded.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce.modern.ui.SkinLoaded', [
], function () {
	var fireSkinLoaded = function (editor) {
		return function() {
			if (editor.initialized) {
				editor.fire('SkinLoaded');
			} else {
				editor.on('init', function() {
					editor.fire('SkinLoaded');
				});
			}
		};
	};

	return {
		fireSkinLoaded: fireSkinLoaded
	};
});
