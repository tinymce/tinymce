/**
 * Notification.js
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
 * @extends tinymce.ui.Container
 * @mixes tinymce.ui.Movable
 */
define("tinymce/ui/Notification", [
	"tinymce/ui/Control",
	"tinymce/ui/Movable",
	"tinymce/ui/Progress",
	"tinymce/util/Delay"
], function(Control, Movable, Progress, Delay) {
	return Control.extend({
		Mixins: [Movable],

		Defaults: {
			classes: 'widget notification'
		},

		init: function(settings) {
			var self = this;

			self._super(settings);

			if (settings.text) {
				self.text(settings.text);
			}

			if (settings.icon) {
				self.icon = settings.icon;
			}

			if (settings.color) {
				self.color = settings.color;
			}

			if (settings.type) {
				self.classes.add('notification-' + settings.type);
			}

			if (settings.timeout && (settings.timeout < 0 || settings.timeout > 0) && !settings.closeButton) {
				self.closeButton = false;
			} else {
				self.classes.add('has-close');
				self.closeButton = true;
			}

			if (settings.progressBar) {
				self.progressBar = new Progress();
			}

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
			var self = this, prefix = self.classPrefix, icon = '', closeButton = '', progressBar = '', notificationStyle = '';

			if (self.icon) {
				icon = '<i class="' + prefix + 'ico' + ' ' + prefix + 'i-' + self.icon + '"></i>';
			}

			if (self.color) {
				notificationStyle = ' style="background-color: ' + self.color + '"';
			}

			if (self.closeButton) {
				closeButton = '<button type="button" class="' + prefix + 'close" aria-hidden="true">\u00d7</button>';
			}

			if (self.progressBar) {
				progressBar = self.progressBar.renderHtml();
			}

			return (
				'<div id="' + self._id + '" class="' + self.classes + '"' + notificationStyle + ' role="presentation">' +
					icon +
					'<div class="' + prefix + 'notification-inner">' + self.state.get('text') + '</div>' +
					progressBar +
					closeButton +
				'</div>'
			);
		},

		postRender: function() {
			var self = this;

			Delay.setTimeout(function() {
				self.$el.addClass(self.classPrefix + 'in');
			});

			return self._super();
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:text', function(e) {
				self.getEl().childNodes[1].innerHTML = e.value;
			});
			if (self.progressBar) {
				self.progressBar.bindStates();
			}
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