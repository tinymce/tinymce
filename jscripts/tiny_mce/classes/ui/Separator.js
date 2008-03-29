/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class This class is used to create vertical separator between other controls.
 * @member tinymce.ui.Separator
 * @base tinymce.ui.Control
 */
tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
	},

	/**#@+
	 * @method
	 */

	/**
	 * Renders the separator as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @return {String} HTML for the separator control element.
	 */
	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix});
	}

	/**#@-*/
});
