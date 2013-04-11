/**
 * TextBox.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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

							if (ctrl.submit) {
								ctrl.submit();
								return false;
							}
						});
					}
				});
			}
		},

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

		repaint: function() {
			var self = this, style, rect, borderBox, borderW = 0, borderH = 0, lastRepaintRect;

			style = self.getEl().style;
			rect = self._layoutRect;
			lastRepaintRect = self._lastRepaintRect || {};

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

			/*if (!self.settings.multiline) {
				//style.lineHeight = (rect.h - borderH) + 'px';
			}*/

			self._lastRepaintRect = lastRepaintRect;
			self.fire('repaint', {}, false);

			return self;
		},

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

		postRender: function() {
			var self = this;

			DomUtils.on(self.getEl(), 'change', function(e) {
				self.fire('change', e);
			});

			return self._super();
		}
	});
});