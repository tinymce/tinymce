/**
 * InsertHorizontalRule.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.GlobalCommands.add('InsertHorizontalRule', function() {
		if (tinymce.isOpera)
			return this.getDoc().execCommand('InsertHorizontalRule', false, '');

		this.selection.setContent('<hr />');
	});
})(tinymce);
