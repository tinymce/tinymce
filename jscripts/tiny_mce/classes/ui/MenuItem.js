/**
 * MenuItem.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	/**
	 * This class is base class for all menu item types like DropMenus items etc. This class should not
	 * be instantiated directly other menu items should inherit from this one.
	 *
	 * @class tinymce.ui.MenuItem
	 * @extends tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method MenuItem
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		/**
		 * Sets the selected state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be selected visually.
		 *
		 * @method setSelected
		 * @param {Boolean} s Boolean state if the control should be selected or not.
		 */
		setSelected : function(s) {
			this.setState('Selected', s);
			this.selected = s;
		},

		/**
		 * Returns true/false if the control is selected or not.
		 *
		 * @method isSelected
		 * @return {Boolean} true/false if the control is selected or not.
		 */
		isSelected : function() {
			return this.selected;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this;
			
			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}
	});
})(tinymce);
