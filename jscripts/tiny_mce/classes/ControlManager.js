/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	/**#@+
	 * @class This class is responsible for managing UI control instances. It's both a factory and a collection for the controls.
	 * @member tinymce.ControlManager
	 */
	tinymce.create('tinymce.ControlManager', {
		/**
		 * Constructs a new control manager instance.
		 * Consult the Wiki for more details on this class.
		 *
		 * @constructor
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

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		/**#@+
		 * @method
		 */

		/**
		 * Returns a control by id or undefined it it wasn't found.
		 *
		 * @param {String} id Control instance name.
		 * @return {tinymce.ui.Control} Control instance or undefined.
		 */
		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		/**
		 * Sets the active state of a control by id.
		 *
		 * @param {String} id Control id to set state on.
		 * @param {bool} s Active state true/false.
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
		 * @param {String} id Control id to set state on.
		 * @param {bool} s Active state true/false.
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
		 * @param {String} n Control name to create for example "separator".
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createControl : function(n) {
			var c, t = this, ed = t.editor;

			each(t.editor.plugins, function(p) {
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
		 * @param {String} id Unique id for the new dropdown instance. For example "some menu".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createDropMenu : function(id, s) {
			var t = this, ed = t.editor, c;

			s = extend({
				'class' : 'mceDropDown'
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';

			id = t.prefix + id;
			c = t.controls[id] = new tinymce.ui.DropMenu(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						ed.execCommand(s.cmd, s.ui || false, v || s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			return t.add(c);
		},

		/**
		 * Creates a list box control instance by id. A list box is either a native select element or a DOM/JS based list box control. This
		 * depends on the use_native_selects settings state.
		 *
		 * @param {String} id Unique id for the new listbox instance. For example "styles".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createListBox : function(id, s) {
			var t = this, ed = t.editor, cmd, c;

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
				'class' : id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (ed.settings.use_native_selects)
				c = new tinymce.ui.NativeListBox(id, s);
			else
				c = new tinymce.ui.ListBox(id, s);

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark('simple');
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
		 * @param {String} id Unique id for the new button instance. For example "bold".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createButton : function(id, s) {
			var t = this, ed = t.editor, o;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : id,
				scope : s.scope
			}, s);

			id = t.prefix + id;

			return t.add(new tinymce.ui.Button(id, s));
		},

		/**
		 * Creates a split button control instance by id.
		 *
		 * @param {String} id Unique id for the new split button instance. For example "spellchecker".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSplitButton : function(id, s) {
			var t = this, ed = t.editor, cmd, c;

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
				'class' : id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			c = t.add(new tinymce.ui.SplitButton(id, s));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		/**
		 * Creates a color split button control instance by id.
		 *
		 * @param {String} id Unique id for the new color split button instance. For example "forecolor".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createColorSplitButton : function(id, s) {
			var t = this, ed = t.editor, cmd, c;

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
				'class' : id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('more_colors')
			}, s);

			id = t.prefix + id;
			c = new tinymce.ui.ColorSplitButton(id, s);
			ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		/**
		 * Creates a toolbar container control instance by id.
		 *
		 * @param {String} id Unique id for the new toolbar container control instance. For example "toolbar1".
		 * @param {Object} s Optional settings object for the control.
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createToolbar : function(id, s) {
			var c = new tinymce.ui.Toolbar(id, s);

			if (this.get(id))
				return null;

			return this.add(c);
		},

		/**
		 * Creates a separator control instance.
		 *
		 * @return {tinymce.ui.Control} Control instance that got created and added.
		 */
		createSeparator : function() {
			return new tinymce.ui.Separator();
		}

		/**#@-*/
	});
})();
