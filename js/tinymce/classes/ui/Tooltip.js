/**
 * Tooltip.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less ToolTip.less
 * @class tinymce.ui.ToolTip
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Tooltip", [
	"tinymce/ui/Control",
	"tinymce/ui/Movable"
], function(Control, Movable) {
	return Control.extend({
		Mixins: [Movable],

		Defaults: {
			classes: 'widget tooltip tooltip-n'
		},

		text: function(value) {
			var self = this;

			if (typeof(value) != "undefined") {
				self._value = value;

				if (self._rendered) {
					self.getEl().lastChild.innerHTML = self.encode(value);
				}

				return self;
			}

			return self._value;
		},

		renderHtml: function() {
			var self = this, prefix = self.classPrefix;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" role="presentation">' +
					'<div class="' + prefix + 'tooltip-arrow"></div>' +
					'<div class="' + prefix + 'tooltip-inner">' + self.encode(self._text) + '</div>' +
				'</div>'
			);
		},

		repaint: function() {
			var self = this, style, rect;

			style = self.getEl().style;
			rect = self._layoutRect;

			style.left = rect.x + 'px';
			style.top = rect.y + 'px';
			style.zIndex = 0xFFFF + 0xFFFF;
		}
	});
});