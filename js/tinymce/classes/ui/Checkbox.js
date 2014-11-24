/**
 * Checkbox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates a custom checkbox.
 *
 * @example
 * // Create and render a checkbox to the body element
 * tinymce.ui.Factory.create({
 *     type: 'checkbox',
 *     checked: true,
 *     tristate: false,
 *     text: 'My checkbox'
 * }).renderTo(document.body);
 *
 * @-x-less Checkbox.less
 * @class tinymce.ui.Checkbox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Checkbox", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "checkbox",
			role: "checkbox",
			checked: false,
			tristate: false
		},

		/**
		 * Constructs a new Checkbox instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} checked True if the checkbox should be checked by default.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self.on('click', function(e) {
				e.preventDefault();

				if (!self.disabled()) {
					var checked = self.checked();
					if (self.settings.tristate) {
						if (checked === null) {
							checked = true;
						} else if (checked) {
							checked = false;
						} else {
							checked = null;
						}
					} else {
						checked = !checked;
					}
					self.checked(checked);
				}
			});

			self.checked(self.settings.checked);
		},

		/**
		 * Getter/setter function for the checked state.
		 *
		 * @method checked
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		checked: function(state) {
			var self = this;

			if (typeof state != "undefined") {
				self.removeClass('indeterminate');
				if ((state === null) && self.settings.tristate) {
					self.addClass('indeterminate');
					self.addClass('checked');
				} else if (state) {
					self.removeClass('indeterminate');
					self.addClass('checked');
				} else {
					self.removeClass('indeterminate');
					self.removeClass('checked');
				}

				self._checked = state;
				self.aria('checked', state);

				return self;
			}

			return self._checked;
		},

		/**
		 * Getter/setter function for the value state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		value: function(state) {
			return this.checked(state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes() + '" unselectable="on" aria-labelledby="' + id + '-al" tabindex="-1">' +
					'<i class="' + prefix + 'ico ' + prefix + 'i-checkbox"></i>' +
					'<span id="' + id + '-al" class="' + prefix + 'label">' + self.encode(self._text) + '</span>' +
				'</div>'
			);
		}
	});
});