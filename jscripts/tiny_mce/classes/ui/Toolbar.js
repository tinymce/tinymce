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
		var t = this, h = '', c, co, dom = tinymce.DOM, s = t.settings, i, pr, nx, cl;

		h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i -1];
			nx = cl[i + 1];
			c = co.constructor === tinymce.ui.ListBox;

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (c) {
				if (pr && pr.constructor === tinymce.ui.Button)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML
			h += '<td>' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (c) {
				if (nx && nx.constructor === tinymce.ui.Button)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		co = t.controls[t.controls.length - 1].constructor;

		c = 'mceToolbarEnd';
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
