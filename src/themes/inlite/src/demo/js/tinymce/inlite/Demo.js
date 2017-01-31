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

define('tinymce/inlite/Demo', [
	'tinymce/inlite/Theme',
	'global!tinymce'
], function(Theme, tinymce) {
	tinymce.init({
		selector: 'div.tinymce',
		theme: 'inlite',
		plugins: 'image table link anchor paste contextmenu textpattern autolink',
		insert_toolbar: 'quickimage quicktable',
		selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
		inline: true,
		paste_data_images: true,
		filepicker_validator_handler: function (query, success) {
			var valid = /^https?:/.test(query.url);

			success({
				status: valid ? 'valid' : 'invalid',
				message: valid ? 'Url seems to be valid' : 'Are you use that this url is valid?'
			});
		},
		file_picker_callback: function () {}
	});

	return function() {};
});
