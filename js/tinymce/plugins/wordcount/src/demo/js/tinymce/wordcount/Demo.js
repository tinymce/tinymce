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

define("tinymce.wordcount.Demo", [
	"tinymce.wordcount.Plugin",
	"global!tinymce"
], function(Plugin, tinymce) {
	return function() {

		tinymce.init({
			//imagetools_cors_hosts: ["moxiecode.cachefly.net"],
			//imagetools_proxy: "proxy.php",
			//imagetools_api_key: '123',

			//images_upload_url: 'postAcceptor.php',
			//images_upload_base_path: 'base/path',
			//images_upload_credentials: true,

			selector: "textarea.tinymce",
			theme: "modern",
			plugins: [
				"wordcount"
			],
			height: 600,
			// toolbar1: "undo redo | styleselect | alignleft aligncenter alignright alignjustify | link | media | emoticons",
		});
	};
});
