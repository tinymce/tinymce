/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define("tinymce.media.Demo", [
	"tinymce.media.Plugin",
	"global!tinymce"
], function (Plugin, tinymce) {
	return function () {

		tinymce.init({
			selector: "textarea.tinymce",
			theme: "modern",
			plugins: ["media"],
			toolbar: "media",
			height: 600,
			// media_live_embeds: false,
			// media_embed_handler: function (data, resolve) {
			// 	resolve({
			// 		html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
			// }
		});
	};
});
