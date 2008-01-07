/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class This class is used to create toolbars a toolbar is a container for other controls like buttons etc.
 * @member tinymce.ui.Toolbar
 * @base tinymce.ui.Container
 */
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	/**#@+
	 * @method
	 */

	/**
	 * Renders the toolbar as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = '', c = 'mceToolbarEnd', co, dom = tinymce.DOM, s = t.settings;

		h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));

		tinymce.each(t.controls, function(c) {
			h += '<td>' + c.renderHTML() + '</td>';
		});

		co = t.controls[t.controls.length - 1].constructor;

		if (co === tinymce.ui.Button)
			c += ' mceToolbarEndButton';
		else if (co === tinymce.ui.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co === tinymce.ui.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || ''}, '<tbody><tr>' + h + '</tr></tbody>');
	}

	/**#@-*/
});
