/**
 * Label.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Label.less
 * @class tinymce.ui.Label
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Label", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('widget');
			self.addClass('label');
			self.canFocus = false;

			if (settings.multiline) {
				self.addClass('autoscroll');
			}

			if (settings.strong) {
				self.addClass('strong');
			}
		},

		initLayoutRect: function() {
			var self = this, layoutRect = self._super();

			if (self.settings.multiline) {
				// Check if the text fits within maxW if not then try word wrapping it
				if (self.getEl().offsetWidth > layoutRect.maxW) {
					layoutRect.minW = layoutRect.maxW;
					self.addClass('multiline');
				}

				self.getEl().style.width = layoutRect.minW + 'px';
				layoutRect.startMinH = layoutRect.h = layoutRect.minH = Math.min(layoutRect.maxH, self.getEl().offsetHeight);
			}

			return layoutRect;
		},

		disabled: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.toggleClass('label-disabled', state);

				if (self._rendered) {
					self.getEl()[0].className = self.classes();
				}
			}

			return self._super(state);
		},

		repaint: function() {
			var self = this;

			if (!self.settings.multiline) {
				self.getEl().style.lineHeight = self.layoutRect().h + 'px';
			}

			return self._super();
		},

		text: function(text) {
			var self = this;

			if (self._rendered && text) {
				self.getEl().innerHTML = self.encode(text);
			}

			return self._super(text);
		},

		/**
		 * ...
		 *
		 * @method render
		 */
		renderHtml: function() {
			var self = this, forId = self.settings.forId;

			return (
				'<label id="' + self._id + '" class="' + self.classes() + '"' + (forId ? ' for="' + forId : '') + '">' +
					self.encode(self._text) +
				'</label>'
			);
		}
	});
});