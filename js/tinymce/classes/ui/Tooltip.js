/**
 * Tooltip.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a tooltip instance.
 *
 * @-x-less ToolTip.less
 * @class tinymce.ui.ToolTip
 * @extends tinymce.ui.Control
 * @mixes tinymce.ui.Movable
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

		/**
		 * Sets/gets the current label text.
		 *
		 * @method text
		 * @param {String} [text] New label text.
		 * @return {String|tinymce.ui.Tooltip} Current text or current label instance.
		 */
		text: function(value) {
			var self = this;

			if (typeof value != "undefined") {
				self._value = value;

				if (self._rendered) {
					self.getEl().lastChild.innerHTML = self.encode(value);
				}

				return self;
			}

			return self._value;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, prefix = self.classPrefix;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" role="presentation">' +
					'<div class="' + prefix + 'tooltip-arrow"></div>' +
					'<div class="' + prefix + 'tooltip-inner">' + self.encode(self._text) + '</div>' +
				'</div>'
			);
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
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