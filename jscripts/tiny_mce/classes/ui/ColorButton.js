/**
 * ColorSplitButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event;

	/**
	 * This class is used to create a color split button that gets rid of the 'split' part of the
	 * button to create the appearance of a normal button. 
	 *
	 * @class tinymce.ui.ColorButton
	 * @extends tinymce.ui.ColorSplitButton
	 */
	tinymce.create('tinymce.ui.ColorButton:tinymce.ui.ColorSplitButton', {
		ColorButton: function(id, s) {
			var t = this;

			t.parent(id, s);
		},

		postRender: function() {
			var t = this, id = t.id;

			Event.add(t.id + '_action', 'click', t.showMenu, t);
			DOM.hide(DOM.get(t.id + '_open').parentNode);

			// Handle focus events
			t.setUpFocus();

			// Old IE doesn't have hover on all elements
			t.setUpIEHover();

			// Set up the color preview on the button
			t.setUpColorPreview();
		},

		/**
		 * Function that determines whether the given event should prevent the menu from hiding.
		 *
		 * @method preventHideMenu
		 * @param {Event} e Event object
		 */
		preventHideMenu: function(e) {
			var t = this;
			return e.id === t.id + '_open' || e.id === t.id + '_action';
		}
	});
})(tinymce);
