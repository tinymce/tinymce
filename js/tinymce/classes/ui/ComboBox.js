/**
 * ComboBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a combobox control. Select box that you select a value from or
 * type a value into.
 *
 * @-x-less ComboBox.less
 * @class tinymce.ui.ComboBox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/ComboBox", [
	"tinymce/ui/Widget",
	"tinymce/ui/DomUtils"
], function(Widget, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} placeholder Placeholder text to display.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('combobox');

			self.on('click', function(e) {
				var elm = e.target;

				while (elm) {
					if (elm.id && elm.id.indexOf('-open') != -1) {
						self.fire('action');
					}

					elm = elm.parentNode;
				}
			});

			// TODO: Rework this
			self.on('keydown', function(e) {
				if (e.target.nodeName == "INPUT" && e.keyCode == 13) {
					self.parents().reverse().each(function(ctrl) {
						e.preventDefault();
						self.fire('change');

						if (ctrl.hasEventListeners('submit') && ctrl.toJSON) {
							ctrl.fire('submit', {data: ctrl.toJSON()});
							return false;
						}
					});
				}
			});

			if (settings.placeholder) {
				self.addClass('placeholder');

				self.on('focusin', function() {
					if (!self._hasOnChange) {
						DomUtils.on(self.getEl('inp'), 'change', function() {
							self.fire('change');
						});

						self._hasOnChange = true;
					}

					if (self.hasClass('placeholder')) {
						self.getEl('inp').value = '';
						self.removeClass('placeholder');
					}
				});

				self.on('focusout', function() {
					if (self.value().length === 0) {
						self.getEl('inp').value = settings.placeholder;
						self.addClass('placeholder');
					}
				});
			}
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
				self.removeClass('placeholder');

				if (self._rendered) {
					self.getEl('inp').value = value;
				}

				return self;
			}

			if (self._rendered) {
				value = self.getEl('inp').value;

				if (value != self.settings.placeholder) {
					return value;
				}

				return '';
			}

			return self._value;
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
				self.getEl('inp').disabled = state;
			}

			return self._super(state);
		},

		/**
		 * Focuses the input area of the control.
		 *
		 * @method focus
		 */
		focus: function() {
			this.getEl('inp').focus();
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, elm = self.getEl(), openElm = self.getEl('open'), rect = self.layoutRect();
			var width, lineHeight;

			if (openElm) {
				width = rect.w - DomUtils.getSize(openElm).width - 10;
			} else {
				width = rect.w - 10;
			}

			// Detect old IE 7+8 add lineHeight to align caret vertically in the middle
			var doc = document;
			if (doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
				lineHeight = (self.layoutRect().h - 2) + 'px';
			}

			DomUtils.css(elm.firstChild, {
				width: width,
				lineHeight: lineHeight
			});

			self._super();

			return self;
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ComboBox} Current combobox instance.
		 */
		postRender: function() {
			var self = this;

			DomUtils.on(this.getEl('inp'), 'change', function() {
				self.fire('change');
			});

			return self._super();
		},

		remove: function() {
			DomUtils.off(this.getEl('inp'));
			this._super();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix;
			var value = settings.value || settings.placeholder || '';
			var icon, text, openBtnHtml = '';

			icon = settings.icon ? prefix + 'ico ' + prefix + 'i-' + settings.icon : '';
			text = self._text;

			if (icon || text) {
				openBtnHtml = (
					'<div id="' + id + '-open" class="' + prefix + 'btn ' + prefix + 'open" tabIndex="-1">' +
						'<button id="' + id + '-action" type="button" hidefocus tabindex="-1">' +
							(icon ? '<i class="' + icon + '"></i>' : '<i class="' + prefix + 'caret"></i>') +
							(text ? (icon ? ' ' : '') + text : '') +
						'</button>' +
					'</div>'
				);

				self.addClass('has-open');
			}

			return (
				'<div id="' + id + '" class="' + self.classes() + '">' +
					'<input id="' + id + '-inp" class="' + prefix + 'textbox ' + prefix + 'placeholder" value="' +
					value + '" hidefocus="true"' + (self.disabled() ? ' disabled="disabled"' : '') + '>' +
					openBtnHtml +
				'</div>'
			);
		}
	});
});