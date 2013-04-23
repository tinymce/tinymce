/**
 * Checkbox.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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
			checked: false
		},

		init: function(settings) {
			var self = this;

			self._super(settings);

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self.on('click', function(e) {
				e.preventDefault();

				if (!self.disabled()) {
					self.checked(!self.checked());
				}
			});

			self.checked(self.settings.checked);
		},

		checked: function(state) {
			var self = this;

			if (typeof state != "undefined") {
				if (state) {
					self.addClass('checked');
				} else {
					self.removeClass('checked');
				}

				self._checked = state;
				self.aria('checked', state);

				return self;
			}

			return self._checked;
		},

		value: function(state) {
			return this.checked(state);
		},

		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes() + '" unselectable="on" aria-labeledby="' + id + '-al" tabindex="-1">' +
					'<i class="' + prefix + 'ico ' + prefix + 'i-checkbox"></i>' +
					'<span id="' + id +'-al" class="' + prefix + 'label">' + self.encode(self._text) + '</span>' +
				'</div>'
			);
		}
	});
});