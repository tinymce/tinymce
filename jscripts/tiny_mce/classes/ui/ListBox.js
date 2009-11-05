/**
 * ListBox.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class is used to create list boxes/select list. This one will generate
	 * a non native control. This one has the benefits of having visual items added.
	 *
	 * @class tinymce.ui.ListBox
	 * @extends tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		/**
		 * Constructs a new listbox control instance.
		 *
		 * @constructor
		 * @method ListBox
		 * @param {String} id Control id for the list box.
		 * @param {Object} s Optional name/value settings object.
		 */
		ListBox : function(id, s) {
			var t = this;

			t.parent(id, s);

			/**
			 * Array of ListBox items.
			 *
			 * @property items
			 * @type Array
			 */
			t.items = [];

			/**
			 * Fires when the selection has been changed.
			 *
			 * @event onChange
			 */
			t.onChange = new Dispatcher(t);

			/**
			 * Fires after the element has been rendered to DOM.
			 *
			 * @event onPostRender
			 */
			t.onPostRender = new Dispatcher(t);

			/**
			 * Fires when a new item is added.
			 *
			 * @event onAdd
			 */
			t.onAdd = new Dispatcher(t);

			/**
			 * Fires when the menu gets rendered.
			 *
			 * @event onRenderMenu
			 */
			t.onRenderMenu = new tinymce.util.Dispatcher(this);

			t.classPrefix = 'mceListBox';
		},

		/**
		 * Selects a item/option by value. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method select
		 * @param {String/function} va Value to look for inside the list box or a function selector.
		 */
		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && va.call)
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		/**
		 * Selects a item/option by index. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @method selectByIndex
		 * @param {String} idx Index to select, pass -1 to select menu/title of select box.
		 */
		selectByIndex : function(idx) {
			var t = this, e, o;

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.removeClass(e, 'mceTitle');
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
				}

				e = 0;
			}
		},

		/**
		 * Adds a option item to the list box.
		 *
		 * @method add
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
		 * @method getLength
		 * @param {Number} Number of items inside the list box.
		 */
		getLength : function() {
			return this.items.length;
		},

		/**
		 * Renders the list box as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
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
		 *
		 * @method showMenu
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
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

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

			//DOM.get(t.id + '_text').focus();
		},

		/**
		 * Hides the drop menu.
		 *
		 * @method hideMenu
		 */
		hideMenu : function(e) {
			var t = this;

			if (t.menu && t.menu.isMenuVisible) {
				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
					return;

				if (!e || !DOM.getParent(e.target, '.mceMenu')) {
					DOM.removeClass(t.id, t.classPrefix + 'Selected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					t.menu.hideMenu();
				}
			}
		},

		/**
		 * Renders the menu to the DOM.
		 *
		 * @method renderMenu
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
				'class' : 'mceMenuItemTitle',
				onclick : function() {
					if (t.settings.onselect('') !== false)
						t.select(''); // Must be runned after
				}
			});

			each(t.items, function(o) {
				// No value then treat it as a title
				if (o.value === undefined) {
					m.add({
						title : o.title,
						'class' : 'mceMenuItemTitle',
						onclick : function() {
							if (t.settings.onselect('') !== false)
								t.select(''); // Must be runned after
						}
					});
				} else {
					o.id = DOM.uniqueId();
					o.onclick = function() {
						if (t.settings.onselect(o.value) !== false)
							t.select(o.value); // Must be runned after
					};

					m.add(o);
				}
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id + '_text', 'focus', function(e) {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id + '_text', 'keydown', function(e) {
						var idx = -1, v, kc = e.keyCode;

						// Find current index
						each(t.items, function(v, i) {
							if (t.selectedValue == v.value)
								idx = i;
						});

						// Move up/down
						if (kc == 38)
							v = t.items[idx - 1];
						else if (kc == 40)
							v = t.items[idx + 1];
						else if (kc == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							t.settings.onselect(v);
							return Event.cancel(e);
						}

						if (v) {
							t.hideMenu();
							t.select(v.value);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id + '_text', 'blur', function() {Event.remove(t.id + '_text', 'keydown', t.keyDownHandler); t._focused = 0;});

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

		/**
		 * Destroys the ListBox i.e. clear memory and events.
		 *
		 * @method destroy
		 */
		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);