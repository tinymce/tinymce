/**
 * Toolbar.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to create toolbars a toolbar is a container for other controls like buttons etc.
 *
 * @class tinymce.ui.Toolbar
 * @extends tinymce.ui.Container
 */
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	/**
	 * Renders the toolbar as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = '', c, co, dom = tinymce.DOM, s = t.settings, i, pr, nx, cl, toolbarName = s.name || '';

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i - 1];
			nx = cl[i + 1];

			// Add toolbar start
			if (i === 0) {
				c = 'mceToolbarStart';

				if (co.Button)
					c += ' mceToolbarStartButton';
				else if (co.SplitButton)
					c += ' mceToolbarStartSplitButton';
				else if (co.ListBox)
					c += ' mceToolbarStartListBox';

				h += dom.createHTML('td', {'class' : c, role : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (pr && co.ListBox) {
				if (pr.Button || pr.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd', role : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML

			// IE 8 quick fix, needed to propertly generate a hit area for anchors
			if (dom.stdMode)
				h += '<td style="position: relative" role="presentation">' + co.renderHTML() + '</td>';
			else
				h += '<td role="presentation">' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (nx && co.ListBox) {
				if (nx.Button || nx.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart', role : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		c = 'mceToolbarEnd';

		if (co.Button)
			c += ' mceToolbarEndButton';
		else if (co.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c, role : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || '', role: 'toolbar', 'aria-label': toolbarName, tabindex: '-1'}, '<tbody><tr role="presentation">' + h + '</tr></tbody>');
	},
	
	postRender : function() {
		var t = this, dom = tinymce.DOM, toolbarElement = dom.get(t.id);
		dom.bind(toolbarElement, 'keydown', t.keydown, t);
		dom.setAttrib(t.controls[0].id, 'tabindex', 0);
		dom.setAttrib(toolbarElement, 'aria-activedescendant', t.controls[0].id);
		tinymce.each(t.controls, function(control) {
			dom.bind(control.id, 'focus', function() {
				dom.setAttrib(toolbarElement, 'aria-activedescendant', control.id);
			});
		});
	},
	
	keydown : function(evt) {
		var t = this, DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_ESCAPE = 27, dom = tinymce.DOM, controls = t.controls, focussedId = dom.getAttrib(t.id, 'aria-activedescendant'), idx, newFocus;
		// TODO: May need to reverse direction in RTL languages.
		function moveFocus(dir) {
			if (!focussedId) return;
			
			tinymce.each(t.controls, function(control, itemIndex) {
				if (focussedId === control.id) {
					idx = itemIndex;
					return false;
				}
			});

			while (!newFocus || !newFocus.id) {
				idx += dir;
				// TODO: Avoid infinite loop if nothing is focussable.
				if (idx < 0) {
					idx = controls.length - 1;
				} else if (idx >= controls.length) {
					idx = 0;
				}
				newFocus = controls[idx];
				// Avoid going into an infinite loop if we get back to where we started and still don't have anything to focus.
				if (newFocus.id === focussedId) break;
			}

			dom.setAttrib(focussedId, 'tabindex', '-1');
			dom.setAttrib(t.id, 'aria-activedescendant', newFocus.id);
			dom.setAttrib(newFocus.id, 'tabindex', '0');
			dom.get(newFocus.id).focus();
			tinymce.dom.Event.cancel(evt);
		}
		
		switch (evt.keyCode) {
			case DOM_VK_LEFT:
				moveFocus(-1);
				break;
			case DOM_VK_RIGHT:
				moveFocus(1);
				break;
			case DOM_VK_ESCAPE:
				t.editor.focus();
				break;
		}
	}
});
