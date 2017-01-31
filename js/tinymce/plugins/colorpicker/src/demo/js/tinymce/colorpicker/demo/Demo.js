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
	'tinymce.colorpicker.demo.Demo',

	[
		'tinymce.colorpicker.Plugin',
		'global!tinymce'
	],

	function (Plugin, tinymce) {
		return function () {

			document.querySelector('.tinymce').value='<table><tbody><tr><td>One</td></tr></tbody></table>';

			tinymce.init({
				selector: "textarea.tinymce",
				theme: "modern",
				plugins: "table colorpicker code preview",
				toolbar: "table code preview",
				height: 600
			});
		};
	}
);