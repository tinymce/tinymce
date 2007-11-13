/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;

	/**#@+
	 * @class This class is used to create UI color split button. A color split button will present show a small color picker
	 * when you press the open menu.
	 * @member tinymce.ui.ColorSplitButton
	 * @base tinymce.ui.SplitButton
	 */
	tinymce.create('tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton', {
		/**
		 * Constructs a new color split button control instance.
		 *
		 * @param {String} id Control id for the color split button.
		 * @param {Object} s Optional name/value settings object.
		 */
		ColorSplitButton : function(id, s) {
			var t = this;

			t.parent(id, s);

			t.settings = s = tinymce.extend({
				colors : '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF',
				grid_width : 8,
				default_color : '#888888'
			}, t.settings);

			t.value = s.default_color;
		},

		/**#@+
		 * @method
		 */

		/**
		 * Shows the color menu. The color menu is a layer places under the button
		 * and displays a table of colors for the user to pick from.
		 */
		showMenu : function() {
			var t = this, r, p, e;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			e = DOM.get(t.id);
			DOM.show(t.id + '_menu');
			DOM.addClass(e, 'mceSplitButtonSelected');
			p2 = DOM.getPos(e);
			DOM.setStyles(t.id + '_menu', {
				left : p2.x,
				top : p2.y + e.clientHeight
			});
			e = 0;

			Event.add(document, 'mousedown', t.hideMenu, t);
		},

		/**
		 * Hides the color menu. The optional event parameter is used to check where the event occured so it
		 * doesn't close them menu if it was a event inside the menu.
		 *
		 * @param {Event} e Optional event object.
		 */
		hideMenu : function(e) {
			var t = this;

			if (!e || !DOM.getParent(e.target, function(n) {return DOM.hasClass(n, 'mceSplitButtonMenu');})) {
				DOM.removeClass(t.id, 'mceSplitButtonSelected');
				Event.remove(document, 'mousedown', t.hideMenu, t);
				DOM.hide(t.id + '_menu');
			}
		},

		/**
		 * Renders the menu to the DOM.
		 */
		renderMenu : function() {
			var t = this, m, i = 0, s = t.settings, n, tb, tr, w;

			w = DOM.add(s.menu_container, 'div', {id : t.id + '_menu', 'class' : s['menu_class'] + ' ' + s['class'], style : 'position:absolute;left:0;top:0;'});
			m = DOM.add(w, 'div', {'class' : s['class'] + ' mceSplitButtonMenu'});
			DOM.add(m, 'span', {'class' : 'mceMenuLine'});

			n = DOM.add(m, 'table', {'class' : 'mceColorSplitMenu'});
			tb = DOM.add(n, 'tbody');

			// Generate color grid
			i = 0;
			each(is(s.colors, 'array') ? s.colors : s.colors.split(','), function(c) {
				c = c.replace(/^#/, '');

				if (!i--) {
					tr = DOM.add(tb, 'tr');
					i = s.grid_width - 1;
				}

				n = DOM.add(tr, 'td');

				n = DOM.add(n, 'a', {
					href : 'javascript:;',
					style : {
						backgroundColor : '#' + c
					}
				});

				Event.add(n, 'mousedown', function() {
					t.setColor('#' + c);
				});
			});

			if (s.more_colors_func) {
				n = DOM.add(tb, 'tr');
				n = DOM.add(n, 'td', {colSpan : s.grid_width, 'class' : 'morecolors'});
				n = DOM.add(n, 'a', {href : 'javascript:;', 'class' : 'morecolors'}, 'More colors');

				Event.add(n, 'mousedown', function() {
					s.more_colors_func.call(s.more_colors_scope || this);
				});
			}

			DOM.addClass(m, 'mceColorSplitMenu');

			return w;
		},

		/**
		 * Sets the current color for the control and hides the menu if it should be visible.
		 *
		 * @param {String} c Color code value in hex for example: #FF00FF
		 */
		setColor : function(c) {
			var t = this, p, s = this.settings, co = s.menu_container, po, cp, id = t.id + '_preview';

			if (!(p = DOM.get(id))) {
				DOM.setStyle(t.id + '_action', 'position', 'relative');
				p = DOM.add(t.id + '_action', 'div', {id : id, 'class' : 'mceColorPreview'});
			}

			p.style.backgroundColor = c;

			t.value = c;
			t.hideMenu();
			s.onselect(c);
		}

		/**#@-*/
	});
})();
