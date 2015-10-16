/**
 * Tooltip.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a notification instance.
 *
 * @-x-less Notification.less
 * @class tinymce.ui.Notification
 * @extends tinymce.ui.Control
 * @mixes tinymce.ui.Movable
 */
define("tinymce/ui/Notification", [
	"tinymce/ui/Container",
	"tinymce/ui/Movable"
], function(Container, Movable) {
	return Container.extend({
		Mixins: [Movable],

		Defaults: {
			classes: 'widget notification'
		},

		init: function(settings) {
			var self = this, prefix = self.classPrefix;

			self._super(settings);

			if (settings.text) {
				self.text(settings.text);
			}

			self.on('postRender', function() {
				if (settings.type) {
					self.getEl().className += ' ' + prefix + 'notification-' + settings.type;
				}
				if (settings.icon) {
					self.getEl().firstChild.className += ' ' + prefix + 'i-' + settings.icon;
				}
				if (settings.timeout && (settings.timeout < 0 || settings.timeout > 0) && !settings.closeButton) {
					self.getEl().lastChild.className += ' ' + prefix + 'hidden';
				}
			});

			self.on('click', function(e) {
				if (e.target.className.indexOf(self.classPrefix + 'close') != -1) {
					self.close();
				}
			});
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
				'<div id="' + self._id + '" class="' + self.classes + '" role="presentation">' +
					'<i class="' + prefix + 'ico"></i>' +
					'<div class="' + prefix + 'notification-inner">' + self.state.get('text') + '</div>' +
					'<button type="button" class="' + prefix + 'close" aria-hidden="true">\u00d7</button>' +
				'</div>'
			);
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:text', function(e) {
				self.getEl().childNodes[1].innerHTML = e.value;
			});

			return self._super();
		},

		close: function() {
			var self = this;

			if (!self.fire('close').isDefaultPrevented()) {
				self.remove();
			}

			return self;
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