/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	/**#@+
	 * @class This class is used to create list boxes/select list. This one will generate
	 * a non native control. This one has the benefits of having visual items added.
	 * @member tinymce.ui.ListBox
	 * @base tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		/**
		 * Constructs a new listbox control instance.
		 *
		 * @param {String} id Control id for the list box.
		 * @param {Object} s Optional name/value settings object.
		 */
		ListBox : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = [];
			t.onChange = new Dispatcher(t);
			t.onPostRender = new Dispatcher(t);
			t.onAdd = new Dispatcher(t);
			t.onRenderMenu = new tinymce.util.Dispatcher(this);
			t.classPrefix = 'mceListBox';
		},

		/**#@+
		 * @method
		 */

		/**
		 * Selects a item/option by value. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @param {String} v Value to look for inside the list box.
		 */
		select : function(v) {
			var t = this, e, fv;

			// Do we need to do something?
			if (v != t.selectedValue) {
				e = DOM.get(t.id + '_text');
				t.selectedValue = v;

				// Find item
				each(t.items, function(o) {
					if (o.value == v) {
						DOM.setHTML(e, DOM.encode(o.title));
						fv = 1;
						return false;
					}
				});

				// If no item was found then present title
				if (!fv) {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					e = 0;
					return;
				} else
					DOM.removeClass(e, 'mceTitle');
			}

			e = 0;
		},

		/**
		 * Adds a option item to the list box.
		 *
		 * @param {String} n Title for the new option.
		 * @param {String} v Value for the new option.
		 * @param {Object} o Optional object with settings like for example class.
		 */
		add : function(n, v, o) {
			var t = this;

			o = o || {};
			o = tinymce.extend(o, {
				title : n,
				value : v
			});

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		/**
		 * Returns the number of items inside the list box.
		 *
		 * @param {Number} Number of items inside the list box.
		 */
		getLength : function() {
			return this.items.length;
		},

		/**
		 * Renders the list box as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @return {String} HTML for the list box control element.
		 */
		renderHTML : function() {
			var h = '', t = this, s = t.settings, cp = t.classPrefix;

			h = '<table id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_text', href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span></span>') + '</td>';
			h += '</tr></tbody></table>';

			return h;
		},

		/**
		 * Displays the drop menu with all items.
		 */
		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length == 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p1 = DOM.getPos(this.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;

			// Select in menu
			if (t.oldID)
				m.items[t.oldID].setSelected(0);

			each(t.items, function(o) {
				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
					t.oldID = o.id;
				}
			});

			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, t.classPrefix + 'Selected');
		},

		/**
		 * Hides the drop menu.
		 */
		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
				return;

			if (!e || !DOM.getParent(e.target, function(n) {return DOM.hasClass(n, 'mceMenu');})) {
				DOM.removeClass(t.id, t.classPrefix + 'Selected');
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);

				if (t.menu)
					t.menu.hideMenu();
			}
		},

		/**
		 * Renders the menu to the DOM.
		 */
		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : t.classPrefix + 'Menu mceNoIcons',
				max_width : 150,
				max_height : 150
			});

			m.onHideMenu.add(t.hideMenu, t);

			m.add({
				title : t.settings.title,
				'class' : 'mceMenuItemTitle'
			}).setDisabled(1);

			each(t.items, function(o) {
				o.id = DOM.uniqueId();
				o.onclick = function() {
					if (t.settings.onselect(o.value) !== false)
						t.select(o.value); // Must be runned after
				};

				m.add(o);
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 */
		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id + '_text', 'focus', function() {t._focused = 1;});
			Event.add(t.id + '_text', 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.addClass(t.id, cp + 'Hover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.removeClass(t.id, cp + 'Hover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
		}

		/**#@-*/
	});
})();