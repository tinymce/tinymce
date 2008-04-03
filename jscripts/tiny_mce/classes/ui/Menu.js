/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	/**#@+
	 * @class This class is base class for all menu types like DropMenus etc. This class should not
	 * be instantiated directly other menu controls should inherit from this one.
	 * @member tinymce.ui.Menu
	 * @base tinymce.ui.MenuItem
	 */
	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		Menu : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = {};
			t.collapsed = false;
			t.menuCount = 0;
			t.onAddItem = new tinymce.util.Dispatcher(this);
		},

		/**#@+
		 * @method
		 */

		/**
		 * Expands the menu, this will show them menu and all menu items.
		 *
		 * @param {bool} d Optional deep state. If this is set to true all children will be expanded as well.
		 */
		expand : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.expand)
						o.expand();
				}, 'items', t);
			}

			t.collapsed = false;
		},

		/**
		 * Collapses the menu, this will hide the menu and all menu items.
		 *
		 * @param {bool} d Optional deep state. If this is set to true all children will be collapsed as well.
		 */
		collapse : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.collapse)
						o.collapse();
				}, 'items', t);
			}

			t.collapsed = true;
		},

		/**
		 * Returns true/false if the menu has been collapsed or not.
		 *
		 * @return {bool} True/false state if the menu has been collapsed or not.
		 */
		isCollapsed : function() {
			return this.collapsed;
		},

		/**
		 * Adds a new menu, menu item or sub classes of them to the drop menu.
		 *
		 * @param {tinymce.ui.Control} o Menu or menu item to add to the drop menu.
		 * @return {tinymce.ui.Control} Same as the input control, the menu or menu item.
		 */
		add : function(o) {
			if (!o.settings)
				o = new tinymce.ui.MenuItem(o.id || DOM.uniqueId(), o);

			this.onAddItem.dispatch(this, o);

			return this.items[o.id] = o;
		},

		/**
		 * Adds a menu separator between the menu items.
		 *
		 * @return {tinymce.ui.MenuItem} Menu item instance for the separator.
		 */
		addSeparator : function() {
			return this.add({separator : true});
		},

		/**
		 * Adds a sub menu to the menu.
		 *
		 * @param {Object} o Menu control or a object with settings to be created into an control.
		 * @return {tinymce.ui.Menu} Menu control instance passed in or created.
		 */
		addMenu : function(o) {
			if (!o.collapse)
				o = this.createMenu(o);

			this.menuCount++;

			return this.add(o);
		},

		/**
		 * Returns true/false if the menu has sub menus or not.
		 *
		 * @return {bool} True/false state if the menu has sub menues or not.
		 */
		hasMenus : function() {
			return this.menuCount !== 0;
		},

		/**
		 * Removes a specific sub menu or menu item from the menu.
		 *
		 * @param {tinymce.ui.Control} o Menu item or menu to remove from menu.
		 * @return {tinymce.ui.Control} Control instance or null if it wasn't found.
		 */
		remove : function(o) {
			delete this.items[o.id];
		},

		/**
		 * Removes all menu items and sub menu items from the menu.
		 */
		removeAll : function() {
			var t = this;

			walk(t, function(o) {
				if (o.removeAll)
					o.removeAll();
				else
					o.remove();

				o.destroy();
			}, 'items', t);

			t.items = {};
		},

		/**
		 * Created a new sub menu for the menu control.
		 *
		 * @param {Object} s Optional name/value settings object.
		 * @return {tinymce.ui.Menu} New drop menu instance.
		 */
		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}

		/**#@-*/
	});
})();