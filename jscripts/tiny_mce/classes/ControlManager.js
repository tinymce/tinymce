/**
 * ControlManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	/**
	 * This class is responsible for managing UI control instances. It's both a factory and a collection for the controls.
	 * @class tinymce.ControlManager
	 */
	tinymce.create('tinymce.ControlManager', {
		/**
		 * Constructs a new control manager instance.
		 * Consult the Wiki for more details on this class.
		 *
		 * @constructor
		 * @method ControlManager
		 * @param {tinymce.Editor} ed TinyMCE editor instance to add the control to.
		 * @param {Object} s Optional settings object for the control manager.
		 */
		ControlManager : function(ed, s) {
			var t = this, i;

			s = s || {};
			t.editor = ed;
			t.controls = {};
			t.onAdd = new tinymce.util.Dispatcher(t);
			t.onPostRender = new tinymce.util.Dispatcher(t);
			t.prefix = s.prefix || ed.id + '_';
			t._cls = {};

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		/**
		 * Returns a control by id or undefined it it wasn't found.
		 *
		 * @method get
		 * @param {String} id Control instance name.
		 * @return {tinymce.ui.Control} Control instance or undefined.
		 */
		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		/**
		 * Sets the active state of a control by id.
		 *
		 * @method setActive
		 * @param {String} id Control id to set state on.
		 * @param {Boolean} s Active state true/false.
		 * @return {tinymce.ui.Control} Control instance that got activated or null if it wasn't found.
		 */
		setActive : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setActive(s);

			return c;
		},

		/**
		 * Sets the dsiabled state of a control by id.
		 *
		 * @method setDisabled
		 * @param {String} id Control id to set state on.
		 * @param {Boolean} s Active state true/false.
		 * @return {tinymce.ui.Control} Control instance that got disabled or null if it wasn't found.
		 */
		setDisabled : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setDisabled(s);

			return c;
		},

		/**
		 * Adds a control to the control collection inside the manager.
		 *
		 * @method add
		 * @param {tinymce.ui.Control} Control instance to add to collection.
		 * @return {tinymce.ui.Control} Control instance that got passed in.
		 */
		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		/**
		 * Creates a control by name, when a control is created it will automatically add it to the control collection.
		 * It first ask all plugins for the specified control if the plugins didn't return a control then the default behavior
		 * will be used.
		 *
		 * @method createControl
		 * @param {String} n Control name to create for example "separator".
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createControl : function(n) {
			var c, t = this, ed = t.editor;

			each(ed.plugins, function(p) {
				if (p.createControl) {
					c = p.createControl(n, t);

					if (c)
						return false;
				}
			});

			switch (n) {
				case "|":
				case "separator":
					return t.createSeparator();
			}

			if (!c && ed.buttons && (c = ed.buttons[n]))
				return t.createButton(n, c);

			return t.add(c);
		},

		/**
		 * Creates a drop menu control instance by id.
		 *
		 * @method createDropMenu
		 * @param {String} id Unique id for the new dropdown instance. For example "some menu".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createDropMenu : function(id, s, cc) {
			var t = this, ed = t.editor, c, bm, v, cls;

			s = extend({
				'class' : 'mceDropDown',
				constrain : ed.settings.constrain_menus
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';
			if (v = ed.getParam('skin_variant'))
				s['class'] += ' ' + ed.getParam('skin') + 'Skin' + v.substring(0, 1).toUpperCase() + v.substring(1);

			id = t.prefix + id;
			cls = cc || t._cls.dropmenu || tinymce.ui.DropMenu;
			c = t.controls[id] = new cls(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						if (s.cmd)
							ed.execCommand(s.cmd, s.ui || false, s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();

					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		/**
		 * Creates a list box control instance by id. A list box is either a native select element or a DOM/JS based list box control. This
		 * depends on the use_native_selects settings state.
		 *
		 * @method createListBox
		 * @param {String} id Unique id for the new listbox instance. For example "styles".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createListBox : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (ed.settings.use_native_selects)
				c = new tinymce.ui.NativeListBox(id, s);
			else {
				cls = cc || t._cls.listbox || tinymce.ui.ListBox;
				c = new cls(id, s);
			}

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark(1);
					});

					// Restore on focus, since it might be lost
					Event.add(n, 'focus', function() {
						ed.selection.moveToBookmark(ed.bookmark);
						ed.bookmark = null;
					});
				});
			}

			if (c.hideMenu)
				ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		/**
		 * Creates a button control instance by id.
		 *
		 * @method createButton
		 * @param {String} id Unique id for the new button instance. For example "bold".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createButton : function(id, s, cc) {
			var t = this, ed = t.editor, o, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.label = ed.translate(s.label);
			s.scope = s.scope || ed;

			if (!s.onclick && !s.menu_button) {
				s.onclick = function() {
					ed.execCommand(s.cmd, s.ui || false, s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				unavailable_prefix : ed.getLang('unavailable', ''),
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (s.menu_button) {
				cls = cc || t._cls.menubutton || tinymce.ui.MenuButton;
				c = new cls(id, s);
				ed.onMouseDown.add(c.hideMenu, c);
			} else {
				cls = t._cls.button || tinymce.ui.Button;
				c = new cls(id, s);
			}

			return t.add(c);
		},

		/**
		 * Creates a menu button control instance by id.
		 *
		 * @method createMenuButton
		 * @param {String} id Unique id for the new menu button instance. For example "menu1".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createMenuButton : function(id, s, cc) {
			s = s || {};
			s.menu_button = 1;

			return this.createButton(id, s, cc);
		},

		/**
		 * Creates a split button control instance by id.
		 *
		 * @method createSplitButton
		 * @param {String} id Unique id for the new split button instance. For example "spellchecker".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.splitbutton || tinymce.ui.SplitButton;
			c = t.add(new cls(id, s));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		/**
		 * Creates a color split button control instance by id.
		 *
		 * @method createColorSplitButton
		 * @param {String} id Unique id for the new color split button instance. For example "forecolor".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createColorSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls, bm;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					if (tinymce.isIE)
						bm = ed.selection.getBookmark(1);

					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('more_colors')
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.colorsplitbutton || tinymce.ui.ColorSplitButton;
			c = new cls(id, s);
			ed.onMouseDown.add(c.hideMenu, c);

			// Remove the menu element when the editor is removed
			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();
					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		/**
		 * Creates a toolbar container control instance by id.
		 *
		 * @method createToolbar
		 * @param {String} id Unique id for the new toolbar container control instance. For example "toolbar1".
		 * @param {Object} s Optional settings object for the control.
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createToolbar : function(id, s, cc) {
			var c, t = this, cls;

			id = t.prefix + id;
			cls = cc || t._cls.toolbar || tinymce.ui.Toolbar;
			c = new cls(id, s);

			if (t.get(id))
				return null;

			return t.add(c);
		},

		/**
		 * Creates a separator control instance.
		 *
		 * @method createSeparator
		 * @param {Object} cc Optional control class to use instead of the default one.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSeparator : function(cc) {
			var cls = cc || this._cls.separator || tinymce.ui.Separator;

			return new cls();
		},

		/**
		 * Overrides a specific control type with a custom class.
		 *
		 * @method setControlType
		 * @param {string} n Name of the control to override for example button or dropmenu.
		 * @param {function} c Class reference to use instead of the default one.
		 * @return {function} Same as the class reference.
		 */
		setControlType : function(n, c) {
			return this._cls[n.toLowerCase()] = c;
		},
	
		/**
		 * Destroy.
		 *
		 * @method destroy
		 */
		destroy : function() {
			each(this.controls, function(c) {
				c.destroy();
			});

			this.controls = null;
		}
	});
})(tinymce);
