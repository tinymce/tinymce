/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
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

		select : function(v) {
			var t = this;

			if (v != t.selectedValue) {
				t.selectedValue = v;

				if (!v) {
					DOM.setHTML(t.id + '_text', DOM.encode(t.settings.title));
					DOM.addClass(t.id + '_text', 'title');
					return;
				}

				DOM.removeClass(t.id + '_text', 'title');

				each(t.items, function(o) {
					if (o.value === v)
						DOM.setHTML(t.id + '_text', DOM.encode(o.title));
				});
			}
		},

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

		getLength : function() {
			return Math.max(this.items.length - 1, 0);
		},

		renderHTML : function() {
			var h = '', t = this, s = t.settings;

			h = '<table id="' + t.id + '" cellpadding="0" cellspacing="0" class="mceListBox mceListBoxEnabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_text', href : 'javascript:;', 'class' : 'text', onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', href : 'javascript:;', 'class' : 'open', onmousedown : 'return false;'}, '<span></span>') + '</td>';
			h += '</tr></tbody></table>';

			return h;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length == 0)
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p1 = DOM.getPos(this.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x - p1.x;
			m.settings.offset_y = p2.y - p1.y;

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

			Event.add(document, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, 'mceListBoxSelected');
		},

		hideMenu : function(e) {
			var t = this;

			if (!e || !DOM.getParent(e.target, function(n) {return DOM.hasClass(n, 'mceMenu');})) {
				DOM.removeClass(t.id, 'mceListBoxSelected');
				Event.remove(document, 'mousedown', t.hideMenu, t);

				if (t.menu)
					t.menu.hideMenu();
			}
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : 'mceListBoxMenu noIcons',
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
				o.func = function() {
					t.execCallback(o.value);
					t.select(o.value); // Must be runned after
				};

				m.add(o);
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		postRender : function() {
			var t = this;

			Event.add(t.id, 'click', t.showMenu, t);

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceListBoxDisabled'))
						DOM.addClass(t.id, 'mceListBoxHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceListBoxDisabled'))
						DOM.removeClass(t.id, 'mceListBoxHover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		execCallback : function() {
			var s = this.settings;

			if (s.func)
				return s.func.apply(s.scope, arguments);
		}
	});
})();