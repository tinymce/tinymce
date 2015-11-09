/**
 * ListBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new list box control.
 *
 * @-x-less ListBox.less
 * @class tinymce.ui.ListBox
 * @extends tinymce.ui.MenuButton
 */
define("tinymce/ui/SelectBox", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	function createOptions(options) {
		var strOptions = '';
		if (options) {
			for (var i = 0; i < options.length; i++) {
				strOptions += '<option value="' + options[i] + '">' + options[i] + '</option>';
			}
		}
		return strOptions;
	}

	return Widget.extend({
		Defaults: {
			classes: "selectbox",
			role: "selectbox",
			options: []
		},
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Array} values Array with values to add to list box.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			if (self.settings.size) {

				self.size = self.settings.size;

			}

			if (self.settings.options) {
				self._options = self.settings.options;
			}

		},

		/**
		 * Getter/setter function for the options state.
		 *
		 * @method options
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		options: function(state) {
			if (!arguments.length) {
				return this.state.get('options');
			}

			this.state.set('options', state);

			return this;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, options, size = '';

			options = createOptions(self._options);

			if (self.size) {
				size = ' size = "' + self.size + '"';
			}

			return (
				'<select id="' + self._id + '" class="' + self.classes + '"' + size + '>' +
					options +
				'</select>'
			);
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {Boolean/tinymce.ui.ListBox} Value or self if it's a set operation.
		 */
		bindStates: function() {
			var self = this;

			self.state.on('change:options', function(e) {
				self.getEl().innerHTML = createOptions(e.value);
			});

			return self._super();
		}
	});
});
