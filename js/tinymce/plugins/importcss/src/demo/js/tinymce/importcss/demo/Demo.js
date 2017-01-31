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
	'tinymce.importcss.demo.Demo',

	[
		'tinymce.importcss.Plugin',
		'global!tinymce'
	],

	function (Plugin, tinymce) {
		return function () {

			document.querySelector('.tinymce').value = 'The format menu should show "red"';

			tinymce.init({
				selector: "textarea.tinymce",
				theme: "modern",
				plugins: "importcss code preview",
				toolbar: "styleselect code preview",
				height: 600,
				content_css: '../css/rules.css'
			});
		};
	}
);