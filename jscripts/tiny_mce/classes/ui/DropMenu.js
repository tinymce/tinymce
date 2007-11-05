/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event, Element = tinymce.dom.Element;

	tinymce.create('tinymce.ui.DropMenu:tinymce.ui.Menu', {
		DropMenu : function(id, s) {
			s = s || {};
			s.container = s.container || document.body;
			s.offset_x = s.offset_x || 0;
			s.offset_y = s.offset_y || 0;
			s.vp_offset_x = s.vp_offset_x || 0;
			s.vp_offset_y = s.vp_offset_y || 0;
			this.parent(id, s);
			this.onHideMenu = new tinymce.util.Dispatcher(this);
			this.classPrefix = 'mceMenu';
		},

		createMenu : function(s) {
			var cs = this.settings, m;

			s.container = s.container || cs.container;
			s.parent = this;
			s.vp_offset_x = s.vp_offset_x || cs.vp_offset_x;
			s.vp_offset_y = s.vp_offset_y || cs.vp_offset_y;
			m = new tinymce.ui.DropMenu(s.id || DOM.uniqueId(), s);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		},

		update : function() {
			var t = this, s = t.settings, tb = DOM.get('menu_' + t.id + '_tbl'), co = DOM.get('menu_' + t.id);

			if (!DOM.boxModel)
				t.element.setStyles({width : tb.clientWidth + 2, height : tb.clientHeight + 2});
			else
				t.element.setStyles({width : tb.clientWidth, height : tb.clientHeight});

			if (s.max_width)
				DOM.setStyle(co, 'width', Math.min(tb.clientWidth, s.max_width));

			if (s.max_height) {
				DOM.setStyle(co, 'height', Math.min(tb.clientHeight, s.max_height));

				if (tb.clientHeight < s.max_height)
					DOM.setStyle(co, 'overflow', 'hidden');
			}
		},

		showMenu : function(x, y, px) {
			var t = this, s = t.settings, co, vp = DOM.getViewPort(), w, h, mx, my, ot, dm, tb;

			t.collapse(1);

			if (t.isMenuVisible)
				return;

			if (!t.rendered) {
				co = DOM.add(t.settings.container, t.renderNode());

				each(t.items, function(o) {
					o.postRender();
				});

				t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});
			} else
				co = DOM.get('menu_' + t.id);

			DOM.setStyles(co, {left : -0xFFFF , top : -0xFFFF});
			DOM.show(co);
			t.update();

			x += s.offset_x;
			y += s.offset_y;
			vp.w -= 20;
			vp.h -= 20;

			// Move inside viewport if not submenu
			ot = 2;
			w = co.clientWidth - ot;
			h = co.clientHeight - ot;
			mx = vp.x + vp.w;
			my = vp.y + vp.h;

			if ((x + s.vp_offset_x + w) > mx)
				x = px ? px - w : Math.max(0, (mx - s.vp_offset_x) - w);

			if ((y + s.vp_offset_y + h) > my)
				y = Math.max(0, (my - s.vp_offset_y) - h);

			DOM.setStyles(co, {left : x , top : y});
			t.element.update();

			t.isMenuVisible = 1;
			t.mouseClickFunc = Event.add(co, 'click', function(e) {
				var m;

				e = e.target;

				if (e && (e = DOM.getParent(e, 'TD'))) {
					m = t.items[e.id];

					if (m.isDisabled())
						return;

					m.execCallback();
					dm = t;

					while (dm) {
						if (dm.hideMenu)
							dm.hideMenu();

						dm = dm.settings.parent;
					}
				}
			});

			if (t.hasMenus()) {
				t.mouseOverFunc = Event.add(co, 'mouseover', function(e) {
					var m, r, mi, p;

					e = e.target;
					if (e && (e = DOM.getParent(e, 'TD'))) {
						m = t.items[e.id];

						if (t.lastMenu)
							t.lastMenu.collapse(1);

						if (m.isDisabled())
							return;

						if (e && DOM.hasClass(e, 'mceMenuItemSub')) {
							p = DOM.getPos(s.container);
							r = DOM.getRect(e);
							m.showMenu((r.x + r.w - ot) - p.x, r.y - ot - p.y, r.x);
							t.lastMenu = m;
							DOM.addClass(DOM.get(m.id).firstChild, 'mceMenuItemActive');
						}
					}
				});
			}
		},

		hideMenu : function() {
			var t = this, co = DOM.get('menu_' + t.id), e;

			if (!t.isMenuVisible)
				return;

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			DOM.hide(co);
			t.isMenuVisible = 0;

			if (t.element)
				t.element.hide();

			if (e = DOM.get(t.id))
				DOM.removeClass(e.firstChild, 'mceMenuItemActive');

			t.onHideMenu.dispatch(t);
		},

		add : function(o) {
			var t = this, co;

			o = t.parent(o);

			if (t.isRendered && (co = DOM.get('menu_' + t.id)))
				t._add(DOM.select('tbody', co)[0], o);

			return o;
		},

		collapse : function(d) {
			this.parent(d);
			this.hideMenu();
		},

		destroy : function() {
			var t = this, co = DOM.get('menu_' + t.id);

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);

			if (t.element)
				t.element.remove();

			DOM.remove(co);
		},

		remove : function(o) {
			DOM.remove(o.id);

			return this.parent(o);
		},

		_add : function(tb, o) {
			var n, s = o.settings, a, ro, it;

			if (s.separator) {
				ro = DOM.add(tb, 'tr', {'class' : 'mceMenuItemSeparator'});
				DOM.add(ro, 'td', {id : o.id, 'class' : 'mceMenuItemSeparator'});

				if (n = ro.previousSibling)
					DOM.addClass(n, 'last');

				return;
			}

			n = ro = DOM.add(tb, 'tr');
			n = it = DOM.add(n, 'td', {id : o.id, 'class' : 'mceMenuItem mceMenuItemEnabled'});
			n = a = DOM.add(n, 'a', {href : 'javascript:;', onmousedown : 'return false;'});

			DOM.addClass(it, s['class']);
//			n = DOM.add(n, 'span', {'class' : 'item'});
			DOM.add(n, 'span', {'class' : 'icon' + (s.icon ? ' ' + s.icon : '')});
			n = DOM.add(n, s.element || 'span', {'class' : 'text', title : o.settings.title}, o.settings.title);

			if (o.settings.style)
				DOM.setAttrib(n, 'style', o.settings.style);

			if (tb.childNodes.length == 1)
				DOM.addClass(ro, 'first');

			if ((n = ro.previousSibling) && DOM.hasClass(n, 'mceMenuItemSeparator'))
				DOM.addClass(ro, 'first');

			if (o.collapse)
				DOM.addClass(it, 'mceMenuItemSub');

			if (n = ro.previousSibling)
				DOM.removeClass(n, 'last');

			DOM.addClass(ro, 'last');
		},

		renderNode : function() {
			var t = this, s = t.settings, n, tb, co;

			co = DOM.create('div', {id : 'menu_' + t.id, 'class' : 'mceMenu' + (s['class'] ? ' ' + s['class'] : '')});
			t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

			if (s.menu_line)
				DOM.add(co, 'span', {'class' : 'mceMenuLine'});

//			n = DOM.add(co, 'div', {id : 'menu_' + t.id + '_co', 'class' : 'mceMenuContainer'});
			n = DOM.add(co, 'table', {id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0});
			tb = DOM.add(n, 'tbody');

			each(t.items, function(o) {
				t._add(tb, o);
			});

			t.rendered = true;

			return co;
		}
	});
})();