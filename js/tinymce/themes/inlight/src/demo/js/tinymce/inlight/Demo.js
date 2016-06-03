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

define('tinymce/inlight/Demo', [
	'tinymce/inlight/Theme',
	'global!tinymce'
], function(Theme, tinymce) {
	tinymce.init({
		selector: 'div.tinymce',
		theme: 'inlight',
		plugins: 'image table link paste contextmenu textpattern',
		insert_toolbar: 'image media table',
		selection_toolbar: 'bold italic | link h1 h2 blockquote',
		inline: true,
		paste_data_images: true
	});

	return function() {};
});
