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
			plugins: "media code preview",
			toolbar: "media code preview",
			media_dimensions: false,
			// media_live_embeds: false,
			// media_url_resolver: function (data, resolve) {
			// 	resolve({
			// 		html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
			// },
			height: 600
		});
	};
});
