/**
 * TextBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new textbox.
 *
 * @-x-less TextBox.less
 * @class tinymce.ui.TextBox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/TextBox", [
	"tinymce/ui/Widget",
	"tinymce/ui/DomUtils"
], function(Widget, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} multiline True if the textbox is a multiline control.
		 * @setting {Number} maxLength Max length for the textbox.
		 * @setting {Number} size Size of the textbox in characters.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self._value = settings.value || '';
			self.addClass('textbox');

			if (settings.multiline) {
				self.addClass('multiline');
			} else {
				// TODO: Rework this
				self.on('keydown', function(e) {
					if (e.keyCode == 13) {
						self.parents().reverse().each(function(ctrl) {
							e.preventDefault();

							if (ctrl.hasEventListeners('submit') && ctrl.toJSON) {
								ctrl.fire('submit', {data: ctrl.toJSON()});
								return false;
							}
						});
					}
				});
			}
		},

		/**
		 * Getter/setter function for the disabled state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.ComboBox} True/false or self if it's a set operation.
		 */
		disabled: function(state) {
			var self = this;

			if (self._rendered && typeof(state) != 'undefined') {
				self.getEl().disabled = state;
			}

			return self._super(state);
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {String|tinymce.ui.ComboBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this;

			if (typeof(value) != "undefined") {
				self._value = value;

				if (self._rendered) {
					self.getEl().value = value;
				}

				return self;
			}

			if (self._rendered) {
				return self.getEl().value;
			}

			return self._value;
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, style, rect, borderBox, borderW = 0, borderH = 0, lastRepaintRect;

			style = self.getEl().style;
			rect = self._layoutRect;
			lastRepaintRect = self._lastRepaintRect || {};

			// Detect old IE 7+8 add lineHeight to align caret vertically in the middle
			var doc = document;
			if (!self.settings.multiline && doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
				style.lineHeight = (rect.h - borderH) + 'px';
			}

			borderBox = self._borderBox;
			borderW = borderBox.left + borderBox.right + 8;
			borderH = borderBox.top + borderBox.bottom + (self.settings.multiline ? 8 : 0);

			if (rect.x !== lastRepaintRect.x) {
				style.left = rect.x + 'px';
				lastRepaintRect.x = rect.x;
			}

			if (rect.y !== lastRepaintRect.y) {
				style.top = rect.y + 'px';
				lastRepaintRect.y = rect.y;
			}

			if (rect.w !== lastRepaintRect.w) {
				style.width = (rect.w - borderW) + 'px';
				lastRepaintRect.w = rect.w;
			}

			if (rect.h !== lastRepaintRect.h) {
				style.height = (rect.h - borderH) + 'px';
				lastRepaintRect.h = rect.h;
			}

			self._lastRepaintRect = lastRepaintRect;
			self.fire('repaint', {}, false);

			return self;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, value = self.encode(self._value, false), extraAttrs = '';

			if ("spellcheck" in settings) {
				extraAttrs += ' spellcheck="' + settings.spellcheck + '"';
			}

			if (settings.maxLength) {
				extraAttrs += ' maxlength="' + settings.maxLength + '"';
			}

			if (settings.size) {
				extraAttrs += ' size="' + settings.size + '"';
			}

			if (settings.subtype) {
				extraAttrs += ' type="' + settings.subtype + '"';
			}

			if (self.disabled()) {
				extraAttrs += ' disabled="disabled"';
			}

			if (settings.multiline) {
				return (
					'<textarea id="' + id + '" class="' + self.classes() + '" ' +
					(settings.rows ? ' rows="' + settings.rows + '"' : '') +
					' hidefocus="true"' + extraAttrs + '>' + value +
					'</textarea>'
				);
			}

			return '<input id="' + id + '" class="' + self.classes() + '" value="' + value + '" hidefocus="true"' + extraAttrs + '>';
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			DomUtils.on(self.getEl(), 'change', function(e) {
				self.fire('change', e);
			});

			return self._super();
		},

		remove: function() {
			DomUtils.off(this.getEl());
			this._super();
		}
	});
});