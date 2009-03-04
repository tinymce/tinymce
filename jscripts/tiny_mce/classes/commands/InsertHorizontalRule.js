/**
 * $Id: EditorCommands.js 1042 2009-03-04 16:00:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	tinymce.GlobalCommands.add('InsertHorizontalRule', function() {
		if (tinymce.isOpera)
			return this.getDoc().execCommand('InsertHorizontalRule', false, '');

		this.selection.setContent('<hr />');
	});
})(tinymce);
