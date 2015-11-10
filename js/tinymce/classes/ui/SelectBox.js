/**
 * SelectBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new select box control.
 *
 * @-x-less SelectBox.less
 * @class tinymce.ui.SelectBox
 * @extends tinymce.ui.Widget
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
		 * @param {Array} [state] State to be set.
		 * @return {Array|tinymce.ui.SelectBox} Array of string options.
		 */
		options: function(state) {
			if (!arguments.length) {
				return this.state.get('options');
			}

			this.state.set('options', state);

			return this;
		},

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

		bindStates: function() {
			var self = this;

			self.state.on('change:options', function(e) {
				self.getEl().innerHTML = createOptions(e.value);
			});

			return self._super();
		}
	});
});
