/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
		renderHTML : function() {
			return DOM.createHTML('span', {'class' : 'mceSeparator'});
		}
	});
})();