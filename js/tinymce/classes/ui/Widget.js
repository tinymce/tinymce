/**
 * Widget.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 *
 * @class tinymce.ui.Widget
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Widget", [
	"tinymce/ui/Control",
	"tinymce/ui/Tooltip"
], function(Control, Tooltip) {
	"use strict";

	var tooltip;

	return Control.extend({
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.canFocus = true;

			if (settings.tooltip) {
				self.on('mouseenter mouseleave', function(e) {
					if (e.control == self && e.type == 'mouseenter') {
						self.tooltip().moveTo(-0xFFFF).text(settings.tooltip).show().moveRel(self.getEl(), 'bc tc');
					} else {
						self.tooltip().moveTo(-0xFFFF).hide();
					}
				});
			}

			self.aria('label', settings.tooltip);
		},

		tooltip: function() {
			var self = this;

			if (!tooltip) {
				tooltip = new Tooltip({type: 'tooltip'});
				tooltip.renderTo(self.getContainerElm());
			}

			return tooltip;
		},

		active: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('pressed', state);
				self.toggleClass('active', state);
			}

			return self._super(state);
		},

		disabled: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('disabled', state);
				self.toggleClass('disabled', state);
			}

			return self._super(state);
		},

		postRender: function() {
			var self = this, settings = self.settings;

			self._rendered = true;

			self._super();

			if (!self.parent() && (settings.width || settings.height)) {
				self.initLayoutRect();
				self.repaint();
			}

			if (settings.autofocus) {
				setTimeout(function() {
					self.focus();
				}, 0);
			}
		},

		remove: function() {
			this._super();

			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		}
	});
});