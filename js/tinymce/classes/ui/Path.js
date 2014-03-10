/**
 * Path.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new path control.
 *
 * @-x-less Path.less
 * @class tinymce.ui.Path
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Path", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} delimiter Delimiter to display between items in path.
		 */
		init: function(settings) {
			var self = this;

			if (!settings.delimiter) {
				settings.delimiter = '\u00BB';
			}

			self._super(settings);
			self.addClass('path');
			self.canFocus = true;

			self.on('click', function(e) {
				var index, target = e.target;

				if ((index = target.getAttribute('data-index'))) {
					self.fire('select', {value: self.data()[index], index: index});
				}
			});
		},

		/**
		 * Focuses the current control.
		 *
		 * @method focus
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		focus: function() {
			var self = this;

			self.getEl().firstChild.focus();

			return self;
		},

		/**
		 * Sets/gets the data to be used for the path.
		 *
		 * @method data
		 * @param {Array} data Array with items name is rendered to path.
		 */
		data: function(data) {
			var self = this;

			if (typeof(data) !== "undefined") {
				self._data = data;
				self.update();

				return self;
			}

			return self._data;
		},

		/**
		 * Updated the path.
		 *
		 * @private
		 */
		update: function() {
			this.innerHtml(this._getPathHtml());
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.data(self.settings.data);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">' +
					self._getPathHtml() +
				'</div>'
			);
		},

		_getPathHtml: function() {
			var self = this, parts = self._data || [], i, l, html = '', prefix = self.classPrefix;

			for (i = 0, l = parts.length; i < l; i++) {
				html += (
					(i > 0 ? '<div class="'+ prefix + 'divider" aria-hidden="true"> ' + self.settings.delimiter + ' </div>' : '') +
					'<div role="button" class="' + prefix + 'path-item' + (i == l - 1 ? ' ' + prefix + 'last' : '') + '" data-index="' +
					i + '" tabindex="-1" id="' + self._id + '-' + i +'" aria-level="' + i + '">' + parts[i].name + '</div>'
				);
			}

			if (!html) {
				html = '<div class="' + prefix + 'path-item">&nbsp;</div>';
			}

			return html;
		}
	});
});