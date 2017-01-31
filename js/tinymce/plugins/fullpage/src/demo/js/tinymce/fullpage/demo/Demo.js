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

define(
	'tinymce.fullpage.demo.Demo',

	[
		'tinymce.fullpage.Plugin',
		'global!tinymce'
	],

	function (Plugin, tinymce) {
		return function () {

			tinymce.init({
				selector: "textarea.tinymce",
				theme: "modern",
				plugins: "fullpage code preview",
				toolbar: "fullpage code preview",
				height: 600
			});
		};
	}
);