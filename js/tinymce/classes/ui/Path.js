/**
 * Path.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Path.less
 * @class tinymce.ui.Path
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Path", [
	"tinymce/ui/Control",
	"tinymce/ui/KeyboardNavigation"
], function(Control, KeyboardNavigation) {
	"use strict";

	return Control.extend({
		Defaults: {
			delimiter: "\u00BB"
		},

		init: function(settings) {
			var self = this;

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

		focus: function() {
			var self = this;

			self.keyNav = new KeyboardNavigation({
				root: self,
				enableLeftRight: true
			});

			self.keyNav.focusFirst();

			return self;
		},

		data: function(data) {
			var self = this;

			if (typeof(data) !== "undefined") {
				self._data = data;
				self.update();

				return self;
			}

			return self._data;
		},

		update: function() {
			this.getEl().innerHTML = this._getPathHtml();
		},

		postRender: function() {
			var self = this;

			self._super();

			self.data(self.settings.data);
		},

		/**
		 * ...
		 *
		 * @method render
		 */
		renderHtml: function() {
			var self = this;

			return (
				'<div id="' + self._id + '" class="' + self.classPrefix + 'path">' +
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
					i + '" tabindex="-1" id="' + self._id + '-' + i +'">' + parts[i].name + '</div>'
				);
			}

			if (!html) {
				html = '<div class="' + prefix + 'path-item">&nbsp;</div>';
			}

			return html;
		}
	});
});