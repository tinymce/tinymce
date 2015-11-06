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
			settings = self.settings;

			if (settings.options) {

				self.options = settings.options;

			}

			if (settings.size) {

				self.size = settings.size;

			}

		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, options, size = '';

			if (self.options) {
				options = createOptions(options);
			}

			if (self.size) {
				size = ' size = "' + self.size + '"';
			}

			return (
				'<select id="' + self._id + '" class="' + self.classes + '"' + size + '>' +
					options +
				'</div>'
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

			self.state.on('change:options', function() {
				var select = self.getEl().firstChild;
				select.innerHTML = createOptions(self.options);
			});

			return self._super();
		}
	});
});
