/**
 * Radio.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Radio.less
 * @class tinymce.ui.Radio
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Radio", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "radio",
			checked: false
		},

		init: function(settings) {
			var self = this;

			self._super(settings);

			self.on('click', function(e) {
				e.preventDefault();

				if (!self.disabled() && !self.checked()) {
					self.parent().items().filter('radio:checked').exec('checked', false);
					self.checked(true);
				}
			});

			self.checked(settings.checked);
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

				return self;
			}

			return self._checked;
		},

		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes() + '" role="radio" unselectable="on">' +
					'<i class="' + prefix + 'ico ' + prefix + 'radio"></i>' +
					self._text +
				'</div>'
			);
		}
	});
});