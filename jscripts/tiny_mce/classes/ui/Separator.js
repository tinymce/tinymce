/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
		renderHTML : function() {
			return DOM.createHTML('span', {'class' : 'mceSeparator'});
		}
	});
})();