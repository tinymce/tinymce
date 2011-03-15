/**
 * MenuButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class is used to create a UI button. A button is basically a link
	 * that is styled to look like a button or icon.
	 *
	 * @class tinymce.ui.MenuButton
	 * @extends tinymce.ui.Control
	 * @example
	 * // Creates a new plugin class and a custom menu button
	 * tinymce.create('tinymce.plugins.ExamplePlugin', {
	 *     createControl: function(n, cm) {
	 *         switch (n) {
	 *             case 'mymenubutton':
	 *                 var c = cm.createSplitButton('mysplitbutton', {
	 *                     title : 'My menu button',
	 *                     image : 'some.gif'
	 *                 });
	 * 
	 *                 c.onRenderMenu.add(function(c, m) {
	 *                     m.add({title : 'Some title', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
	 * 
	 *                     m.add({title : 'Some item 1', onclick : function() {
	 *                         alert('Some item 1 was clicked.');
	 *                     }});
	 * 
	 *                     m.add({title : 'Some item 2', onclick : function() {
	 *                         alert('Some item 2 was clicked.');
	 *                     }});
	 *               });
	 * 
	 *               // Return the new menubutton instance
	 *               return c;
	 *         }
	 * 
	 *         return null;
	 *     }
	 * });
	 */
	tinymce.create('tinymce.ui.MenuButton:tinymce.ui.Button', {
		/**
		 * Constructs a new split button control instance.
		 *
		 * @constructor
		 * @method MenuButton
		 * @param {String} id Control id for the split button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		MenuButton : function(id, s, ed) {
			this.parent(id, s, ed);

			/**
			 * Fires when the menu is rendered.
			 *
			 * @event onRenderMenu
			 */
			this.onRenderMenu = new tinymce.util.Dispatcher(this);

			s.menu_container = s.menu_container || DOM.doc.body;
		},

		/**
		 * Shows the menu.
		 *
		 * @method showMenu
		 */
		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;
			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.setState('Selected', 1);

			t.isMenuVisible = 1;
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
				'class' : this.classPrefix + 'Menu',
				icons : t.settings.icons
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		/**
		 * Hides the menu. The optional event parameter is used to check where the event occured so it
		 * doesn't close them menu if it was a event inside the menu.
		 *
		 * @method hideMenu
		 * @param {Event} e Optional event object.
		 */
		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id || e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				t.setState('Selected', 0);
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}

			t.isMenuVisible = 0;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings;

			Event.add(t.id, 'click', function() {
				if (!t.isDisabled()) {
					if (s.onclick)
						s.onclick(t.value);

					t.showMenu();
				}
			});
		}
	});
})(tinymce);
