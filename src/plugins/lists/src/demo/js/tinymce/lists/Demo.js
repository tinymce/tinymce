/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define("tinymce.lists.Demo", [
	"tinymce.lists.Plugin",
	"global!tinymce"
], function (Plugin, tinymce) {
	return function () {
		tinymce.init({
			selector: "textarea.tinymce",
			theme: "modern",
			plugins: "lists code",
			toolbar: "numlist bullist | outdent indent | code",
			height: 600
		});
	};
});
