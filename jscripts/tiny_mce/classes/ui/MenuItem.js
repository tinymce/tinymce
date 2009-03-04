/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	/**#@+
	 * @class This class is base class for all menu item types like DropMenus items etc. This class should not
	 * be instantiated directly other menu items should inherit from this one.
	 * @member tinymce.ui.MenuItem
	 * @base tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		/**#@+
		 * @method
		 */

		/**
		 * Sets the selected state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be selected visually.
		 *
		 * @param {bool} s Boolean state if the control should be selected or not.
		 */
		setSelected : function(s) {
			this.setState('Selected', s);
			this.selected = s;
		},

		/**
		 * Returns true/false if the control is selected or not.
		 *
		 * @return {bool} true/false if the control is selected or not.
		 */
		isSelected : function() {
			return this.selected;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 */
		postRender : function() {
			var t = this;
			
			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}

		/**#@-*/
	});
})(tinymce);
