/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	tinymce.create('tinymce.ControlManager', {
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

		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		setActive : function(id, s) {
			var c;

			if (c = this.get(id))
				c.setActive(s);
		},

		setDisabled : function(id, s) {
			var c;

			if (c = this.get(id))
				c.setDisabled(s);
		},

		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		createControl : function(n) {
			var c, t = this, ed = t.editor;

			switch (n) {
				case "|":
				case "separator":
					return this.createSeparator();
			}

			each(this.editor.plugins, function(p) {
				if (p.createControl) {
					c = p.createControl(n, t);

					if (c)
						return false;
				}
			});

			if (!c && ed.buttons && (c = ed.buttons[n]))
				return t.createButton(n, c.title, c.cmd, c.settings.scope || ed, c.settings);

			return t.add(c);
		},

		createDropMenu : function(id, s) {
			var t = this, ed = t.editor, c;

			s = extend({
				container : ed.getContainer()
			}, s);

			id = t.prefix + id;
			c = t.controls[id] = new tinymce.ui.DropMenu(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (s.command)
					s.func = t._wrap(s);
			});

			return t.add(c);
		},

		createListBox : function(id, title, cmd_func, scope, s) {
			var t = this, ed = t.editor, cmd, c;

			if (t.get(id))
				return null;

			title = ed.translate(title);
			scope = scope || ed;

			s = extend({
				title : title,
				'class' : id,
				func : t._wrap(cmd_func, 1),
				scope : scope,
				menu_container : ed.id + "_parent",
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

		createButton : function(id, title, cmd_func, scope, s) {
			var t = this, ed = t.editor, o;

			if (t.get(id))
				return null;

			title = ed.translate(title);
			scope = scope || ed;

			s = extend({
				title : title,
				'class' : id,
				func : t._wrap(cmd_func),
				scope : scope
			}, s);

			id = t.prefix + id;

			return t.add(new tinymce.ui.Button(id, s));
		},

		createSplitButton : function(id, title, cmd_func, scope, s) {
			var t = this, ed = t.editor, cmd, c;

			if (t.get(id))
				return null;

			title = ed.translate(title);
			scope = scope || ed;

			s = extend({
				title : title,
				'class' : id,
				func : t._wrap(cmd_func, 1),
				scope : scope,
				menu_container : ed.id + "_parent",
				control_manager : t
			}, s);

			id = t.prefix + id;
			c = t.add(new tinymce.ui.SplitButton(id, s));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		createColorSplitButton : function(id, title, cmd_func, scope, s) {
			var t = this, ed = t.editor, cmd, c;

			if (t.get(id))
				return null;

			title = ed.translate(title);
			scope = scope || ed;

			s = extend({
				title : title,
				'class' : id,
				func : t._wrap(cmd_func, 1),
				scope : scope,
				menu_container : ed.id + "_parent"
			}, s);

			id = t.prefix + id;
			c = new tinymce.ui.ColorSplitButton(id, s);
			ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		createToolbar : function(id, s) {
			var c = new tinymce.ui.Toolbar(id, s);

			if (this.get(id))
				return null;

			return this.add(c);
		},

		createSeparator : function() {
			return new tinymce.ui.Separator();
		},

		_wrap : function(c, v) {
			var o, ed = this.editor;

			// Wrap command
			if (tinymce.is(c, 'string'))
				c = {command : c};

			if (tinymce.is(c, 'object')) {
				o = c;

				if (v) {
					c = function(v) {
						ed.execCommand(o.command, o.ui, v);
					};
				} else {
					c = function(e) {
						ed.execCommand(o.command, o.ui, o.value);
						return Event.cancel(e);
					};
				}
			}

			return c;
		}
	});
})();
