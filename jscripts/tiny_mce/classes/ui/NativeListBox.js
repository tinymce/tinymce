/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class is used to create list boxes/select list. This one will generate
	 * a native control the way that the browser produces them by default.
	 */
	tinymce.create('tinymce.ui.NativeListBox:tinymce.ui.ListBox', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @param {String} id Button control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 */
		NativeListBox : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceNativeListBox';
		},

		/**
		 * Sets the disabled state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be disabled visually.
		 *
		 * @param {bool} s Boolean state if the control should be disabled or not.
		 */
		setDisabled : function(s) {
			DOM.get(this.id).disabled = s;
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @return {bool} true/false if the control is disabled or not.
		 */
		isDisabled : function() {
			return DOM.get(this.id).disabled;
		},

		/**
		 * Selects a item/option by value. This will both add a visual selection to the
		 * item and change the title of the control to the title of the option.
		 *
		 * @param {String} v Value to look for inside the list box.
		 */
		select : function(v) {
			var e = DOM.get(this.id), ol = e.options;

			v = '' + (v || '');

			e.selectedIndex = 0;
			each(ol, function(o, i) {
				if (o.value == v) {
					e.selectedIndex = i;
					return false;
				}
			});
		},

		/**
		 * Adds a option item to the list box.
		 *
		 * @param {String} n Title for the new option.
		 * @param {String} v Value for the new option.
		 * @param {Object} o Optional object with settings like for example class.
		 */
		add : function(n, v, a) {
			var o, t = this;

			a = a || {};
			a.value = v;

			if (t.isRendered())
				DOM.add(DOM.get(this.id), 'option', a, n);

			o = {
				title : n,
				value : v,
				attribs : a
			};

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		/**
		 * Executes the specified callback function for the menu item. In this case when the user clicks the menu item.
		 */
		getLength : function() {
			return DOM.get(this.id).options.length - 1;
		},

		/**
		 * Renders the list box as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @return {String} HTML for the list box control element.
		 */
		renderHTML : function() {
			var h, t = this;

			h = DOM.createHTML('option', {value : ''}, '-- ' + t.settings.title + ' --');

			each(t.items, function(it) {
				h += DOM.createHTML('option', {value : it.value}, it.title);
			});

			h = DOM.createHTML('select', {id : t.id, 'class' : 'mceNativeListBox'}, h);

			return h;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 */
		postRender : function() {
			var t = this;

			t.rendered = true;

			Event.add(t.id, 'change', function(e) {
				var v = e.target.options[e.target.selectedIndex].value;

				t.onChange.dispatch(t, v);
				t.execCallback(v);
			});

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		/**
		 * Executes the specified callback function for the list box. In this case when the user selects a item from the list.
		 */
		execCallback : function() {
			var s = this.settings;

			if (s.func)
				return s.func.apply(s.scope, arguments);
		}
	});
})();