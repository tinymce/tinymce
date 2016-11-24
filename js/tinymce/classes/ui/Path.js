/**
 * Path.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
		 * @setting {String} delimiter Delimiter to display between row in path.
		 */
		init: function(settings) {
			var self = this;

			if (!settings.delimiter) {
				settings.delimiter = '\u00BB';
			}

			self._super(settings);
			self.classes.add('path');
			self.canFocus = true;

			self.on('click', function(e) {
				var index, target = e.target;

				if ((index = target.getAttribute('data-index'))) {
					self.fire('select', {value: self.row()[index], index: index});
				}
			});

			self.row(self.settings.row);
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
		 * @method row
		 * @param {Array} row Array with row name is rendered to path.
		 */
		row: function(row) {
			if (!arguments.length) {
				return this.state.get('row');
			}

			this.state.set('row', row);

			return this;
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
				'<div id="' + self._id + '" class="' + self.classes + '">' +
					self._getDataPathHtml(self.state.get('row')) +
				'</div>'
			);
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:row', function(e) {
				self.innerHtml(self._getDataPathHtml(e.value));
			});

			return self._super();
		},

		_getDataPathHtml: function(data) {
			var self = this, parts = data || [], i, l, html = '', prefix = self.classPrefix;

			for (i = 0, l = parts.length; i < l; i++) {
				html += (
					(i > 0 ? '<div class="' + prefix + 'divider" aria-hidden="true"> ' + self.settings.delimiter + ' </div>' : '') +
					'<div role="button" class="' + prefix + 'path-item' + (i == l - 1 ? ' ' + prefix + 'last' : '') + '" data-index="' +
					i + '" tabindex="-1" id="' + self._id + '-' + i + '" aria-level="' + (i + 1) + '">' + parts[i].name + '</div>'
				);
			}

			if (!html) {
				html = '<div class="' + prefix + 'path-item">\u00a0</div>';
			}

			return html;
		}
	});
});
