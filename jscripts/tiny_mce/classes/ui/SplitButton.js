/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	/**#@+
	 * @class This class is used to create a split button. A button with a menu attached to it.
	 * @member tinymce.ui.SplitButton
	 * @base tinymce.ui.Button
	 */
	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.Button', {
		/**
		 * Constructs a new split button control instance.
		 *
		 * @param {String} id Control id for the split button.
		 * @param {Object} s Optional name/value settings object.
		 */
		SplitButton : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceSplitButton';
			this.onRenderMenu = new tinymce.util.Dispatcher(this);
			s.menu_container = s.menu_container || document.body;
		},

		/**#@+
		 * @method
		 */

		/**
		 * Shows the menu.
		 */
		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.showMenu(0, e.clientHeight);

			Event.add(document, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, 'mceSplitButtonSelected');
		},

		/**
		 * Renders the menu to the DOM.
		 */
		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : 'mceSplitButtonMenu'
			});

			m.onHideMenu.add(t.hideMenu, t);

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Hides the menu. The optional event parameter is used to check where the event occured so it
		 * doesn't close them menu if it was a event inside the menu.
		 *
		 * @param {Event} e Optional event object.
		 */
		hideMenu : function(e) {
			var t = this;

			if (!e || !DOM.getParent(e.target, function(n) {return DOM.hasClass(n, 'mceMenu');})) {
				DOM.removeClass(t.id, 'mceSplitButtonSelected');
				Event.remove(document, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}
		},

		/**
		 * Renders the split button as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @return {String} HTML for the split button control element.
		 */
		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, 'class' : 'action ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'action ' + s['class']});

			h += '<td>' + DOM.createHTML('a', {id : t.id + '_action', href : 'javascript:;', 'class' : 'action ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';
	
			h1 = DOM.createHTML('span', {'class' : 'open ' + s['class']});
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', href : 'javascript:;', 'class' : 'open ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';

			return DOM.createHTML('table', {id : t.id, 'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', onmousedown : 'return false;', title : s.title}, h);
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 */
		postRender : function() {
			var t = this, s = t.settings;

			if (s.onclick) {
				Event.add(t.id + '_action', 'click', function() {
					if (!t.isDisabled())
						s.onclick(t.value);
				});
			}

			Event.add(t.id + '_open', 'click', t.showMenu, t);

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		}

		/**#@-*/
	});
})();
