/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

/**
 * This class is used to create toolbars a toolbar is a container for other controls like buttons etc.
 */
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	/**
	 * Renders the toolbar as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var h = '', c = 'mceToolbarEnd', co, dom = tinymce.DOM;

		h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));

		tinymce.each(this.controls, function(c) {
			h += '<td>' + c.renderHTML() + '</td>';
		});

		co = this.controls[this.controls.length - 1].constructor;

		if (co === tinymce.ui.Button)
			c += ' mceToolbarEndButton';
		else if (co === tinymce.ui.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co === tinymce.ui.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {'class' : 'mceToolbar', cellpadding : '0', cellspacing : '0', align : this.settings.align}, '<tbody><tr>' + h + '</tr></tbody>');
	}
});
