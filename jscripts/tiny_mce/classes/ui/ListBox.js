/**
 * ListBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, undef;

	/**
	 * This class is used to create list boxes/select list. This one will generate
	 * a non native control. This one has the benefits of having visual items added.
	 *
	 * @class tinymce.ui.ListBox
	 * @extends tinymce.ui.Control
	 * @example
	 * // Creates a new plugin class and a custom listbox
	 * tinymce.create('tinymce.plugins.ExamplePlugin', {
	 *     createControl: function(n, cm) {
	 *         switch (n) {
	 *             case 'mylistbox':
	 *                 var mlb = cm.createListBox('mylistbox', {
	 *                      title : 'My list box',
	 *                      onselect : function(v) {
	 *                          tinyMCE.activeEditor.windowManager.alert('Value selected:' + v);
	 *                      }
	 *                 });
	 * 
	 *                 // Add some values to the list box
	 *                 mlb.add('Some item 1', 'val1');
	 *                 mlb.add('some item 2', 'val2');
	 *                 mlb.add('some item 3', 'val3');
	 * 
	 *                 // Return the new listbox instance
	 *                 return mlb;
	 *         }
	 * 
	 *         return null;
	 *     }
	 * });
	 * 
	 * // Register plugin with a short name
	 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
	 * 
	 * // Initialize TinyMCE with the new plugin and button
	 * tinyMCE.init({
	 *    ...
	 *    plugins : '-example', // - means TinyMCE will not try to load it
	 *    theme_advanced_buttons1 : 'mylistbox' // Add the new example listbox to the toolbar
	 * });
	 */
	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		/**
		 * Constructs a new listbox control instance.
		 *
		 * @constructor
		 * @method ListBox
		 * @param {String} id Control id for the list box.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		ListBox : function(id, s, ed) {
			var t = this;

			t.parent(id, s, ed);

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
			t.marked = {};
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

			t.marked = {};

			if (va == undef)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && typeof(va)=="function")
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
			var t = this, e, o, label;

			t.marked = {};

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				label = DOM.get(t.id + '_voiceDesc');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.setHTML(label, t.settings.title + " - " + o.title);
					DOM.removeClass(e, 'mceTitle');
					DOM.setAttrib(t.id, 'aria-valuenow', o.title);
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.setHTML(label, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
					DOM.setAttrib(t.id, 'aria-valuenow', t.settings.title);
				}
				e = 0;
			}
		},

		/**
		 * Marks a specific item by name. Marked values are optional items to mark as active.
		 *
		 * @param {String} value Value item to mark.
		 */
		mark : function(value) {
			this.marked[value] = true;
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

			h = '<span role="listbox" aria-haspopup="true" aria-labelledby="' + t.id +'_voiceDesc" aria-describedby="' + t.id + '_voiceDesc"><table role="presentation" tabindex="0" id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('span', {id: t.id + '_voiceDesc', 'class': 'voiceLabel', style:'display:none;'}, t.settings.title); 
			h += DOM.createHTML('a', {id : t.id + '_text', tabindex : -1, href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>') + '</td>';
			h += '</tr></tbody></table></span>';

			return h;
		},

		/**
		 * Displays the drop menu with all items.
		 *
		 * @method showMenu
		 */
		showMenu : function() {
			var t = this, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length === 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

			// Select in menu
			each(t.items, function(o) {
				if (m.items[o.id]) {
					m.items[o.id].setSelected(0);
				}
			});

			each(t.items, function(o) {
				if (m.items[o.id] && t.marked[o.value]) {
					m.items[o.id].setSelected(1);
				}

				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
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
				DOM.removeClass(t.id, t.classPrefix + 'Selected');

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
				max_width : 250,
				max_height : 150
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

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
				if (o.value === undef) {
					m.add({
						title : o.title,
						role : "option",
						'class' : 'mceMenuItemTitle',
						onclick : function() {
							if (t.settings.onselect('') !== false)
								t.select(''); // Must be runned after
						}
					});
				} else {
					o.id = DOM.uniqueId();
					o.role= "option";
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
			Event.add(t.id, 'keydown', function(evt) {
				if (evt.keyCode == 32) { // Space
					t.showMenu(evt);
					Event.cancel(evt);
				}
			});
			Event.add(t.id, 'focus', function() {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id, 'keydown', function(e) {
						if (e.keyCode == 40) {
							t.showMenu();
							Event.cancel(e);
						}
					});
					t.keyPressHandler = Event.add(t.id, 'keypress', function(e) {
						var v;
						if (e.keyCode == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							Event.cancel(e);
							t.settings.onselect(v);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id, 'blur', function() {
				Event.remove(t.id, 'keydown', t.keyDownHandler);
				Event.remove(t.id, 'keypress', t.keyPressHandler);
				t._focused = 0;
			});

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
