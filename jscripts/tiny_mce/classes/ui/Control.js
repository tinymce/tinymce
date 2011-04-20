/**
 * Control.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten class names
	var DOM = tinymce.DOM, is = tinymce.is;

	/**
	 * This class is the base class for all controls like buttons, toolbars, containers. This class should not
	 * be instantiated directly other controls should inherit from this one.
	 *
	 * @class tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.Control', {
		/**
		 * Constructs a new control instance.
		 *
		 * @constructor
		 * @method Control
		 * @param {String} id Control id.
		 * @param {Object} s Optional name/value settings object.
		 */
		Control : function(id, s, editor) {
			this.id = id;
			this.settings = s = s || {};
			this.rendered = false;
			this.onRender = new tinymce.util.Dispatcher(this);
			this.classPrefix = '';
			this.scope = s.scope || this;
			this.disabled = 0;
			this.active = 0;
			this.editor = editor;
		},
		
		setAriaProperty : function(property, value) {
			var element = DOM.get(this.id + '_aria') || DOM.get(this.id);
			if (element) {
				DOM.setAttrib(element, 'aria-' + property, !!value);
			}
		},
		
		focus : function() {
			DOM.get(this.id).focus();
		},

		/**
		 * Sets the disabled state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be disabled visually.
		 *
		 * @method setDisabled
		 * @param {Boolean} s Boolean state if the control should be disabled or not.
		 */
		setDisabled : function(s) {
			if (s != this.disabled) {
				this.setAriaProperty('disabled', s);

				this.setState('Disabled', s);
				this.setState('Enabled', !s);
				this.disabled = s;
			}
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @method isDisabled
		 * @return {Boolean} true/false if the control is disabled or not.
		 */
		isDisabled : function() {
			return this.disabled;
		},

		/**
		 * Sets the activated state for the control. This will add CSS classes to the
		 * element that contains the control. So that it can be activated visually.
		 *
		 * @method setActive
		 * @param {Boolean} s Boolean state if the control should be activated or not.
		 */
		setActive : function(s) {
			if (s != this.active) {
				this.setState('Active', s);
				this.active = s;
				this.setAriaProperty('pressed', s);
			}
		},

		/**
		 * Returns true/false if the control is disabled or not. This is a method since you can then
		 * choose to check some class or some internal bool state in subclasses.
		 *
		 * @method isActive
		 * @return {Boolean} true/false if the control is disabled or not.
		 */
		isActive : function() {
			return this.active;
		},

		/**
		 * Sets the specified class state for the control.
		 *
		 * @method setState
		 * @param {String} c Class name to add/remove depending on state.
		 * @param {Boolean} s True/false state if the class should be removed or added.
		 */
		setState : function(c, s) {
			var n = DOM.get(this.id);

			c = this.classPrefix + c;

			if (s)
				DOM.addClass(n, c);
			else
				DOM.removeClass(n, c);
		},

		/**
		 * Returns true/false if the control has been rendered or not.
		 *
		 * @method isRendered
		 * @return {Boolean} State if the control has been rendered or not.
		 */
		isRendered : function() {
			return this.rendered;
		},

		/**
		 * Renders the control as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the button control element.
		 */
		renderHTML : function() {
		},

		/**
		 * Renders the control to the specified container element.
		 *
		 * @method renderTo
		 * @param {Element} n HTML DOM element to add control to.
		 */
		renderTo : function(n) {
			DOM.setHTML(n, this.renderHTML());
		},

		/**
		 * Post render event. This will be executed after the control has been rendered and can be used to
		 * set states, add events to the control etc. It's recommended for subclasses of the control to call this method by using this.parent().
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, b;

			// Set pending states
			if (is(t.disabled)) {
				b = t.disabled;
				t.disabled = -1;
				t.setDisabled(b);
			}

			if (is(t.active)) {
				b = t.active;
				t.active = -1;
				t.setActive(b);
			}
		},

		/**
		 * Removes the control. This means it will be removed from the DOM and any
		 * events tied to it will also be removed.
		 *
		 * @method remove
		 */
		remove : function() {
			DOM.remove(this.id);
			this.destroy();
		},

		/**
		 * Destroys the control will free any memory by removing event listeners etc.
		 *
		 * @method destroy
		 */
		destroy : function() {
			tinymce.dom.Event.clear(this.id);
		}
	});
})(tinymce);