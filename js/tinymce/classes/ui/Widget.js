/**
 * Widget.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Widget base class a widget is a control that has a tooltip and some basic states.
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
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} tooltip Tooltip text to display when hovering.
		 * @setting {Boolean} autofocus True if the control should be focused when rendered.
		 * @setting {String} text Text to display inside widget.
		 */
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

		/**
		 * Returns the current tooltip instance.
		 *
		 * @method tooltip
		 * @return {tinymce.ui.Tooltip} Tooltip instance.
		 */
		tooltip: function() {
			var self = this;

			if (!tooltip) {
				tooltip = new Tooltip({type: 'tooltip'});
				tooltip.renderTo(self.getContainerElm());
			}

			return tooltip;
		},

		/**
		 * Sets/gets the active state of the widget.
		 *
		 * @method active
		 * @param {Boolean} [state] State if the control is active.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		active: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('pressed', state);
				self.toggleClass('active', state);
			}

			return self._super(state);
		},

		/**
		 * Sets/gets the disabled state of the widget.
		 *
		 * @method disabled
		 * @param {Boolean} [state] State if the control is disabled.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		disabled: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('disabled', state);
				self.toggleClass('disabled', state);
			}

			return self._super(state);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
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

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			this._super();

			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		}
	});
});