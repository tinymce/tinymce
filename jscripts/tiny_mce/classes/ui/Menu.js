/**
 * Menu.js
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
	 * This class is base class for all menu types like DropMenus etc. This class should not
	 * be instantiated directly other menu controls should inherit from this one.
	 *
	 * @class tinymce.ui.Menu
	 * @extends tinymce.ui.MenuItem
	 */
	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method Menu
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

		/**
		 * Expands the menu, this will show them menu and all menu items.
		 *
		 * @method expand
		 * @param {Boolean} d Optional deep state. If this is set to true all children will be expanded as well.
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
		 * @method collapse
		 * @param {Boolean} d Optional deep state. If this is set to true all children will be collapsed as well.
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
		 * @method isCollapsed
		 * @return {Boolean} True/false state if the menu has been collapsed or not.
		 */
		isCollapsed : function() {
			return this.collapsed;
		},

		/**
		 * Adds a new menu, menu item or sub classes of them to the drop menu.
		 *
		 * @method add
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
		 * @method addSeparator
		 * @return {tinymce.ui.MenuItem} Menu item instance for the separator.
		 */
		addSeparator : function() {
			return this.add({separator : true});
		},

		/**
		 * Adds a sub menu to the menu.
		 *
		 * @method addMenu
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
		 * @method hasMenus
		 * @return {Boolean} True/false state if the menu has sub menues or not.
		 */
		hasMenus : function() {
			return this.menuCount !== 0;
		},

		/**
		 * Removes a specific sub menu or menu item from the menu.
		 *
		 * @method remove
		 * @param {tinymce.ui.Control} o Menu item or menu to remove from menu.
		 * @return {tinymce.ui.Control} Control instance or null if it wasn't found.
		 */
		remove : function(o) {
			delete this.items[o.id];
		},

		/**
		 * Removes all menu items and sub menu items from the menu.
		 *
		 * @method removeAll
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
		 * @method createMenu
		 * @param {Object} s Optional name/value settings object.
		 * @return {tinymce.ui.Menu} New drop menu instance.
		 */
		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}
	});
})(tinymce);