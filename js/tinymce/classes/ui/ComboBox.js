/**
 * ComboBox.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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

						if (ctrl.submit) {
							ctrl.submit();
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

		repaint: function() {
			var self = this, elm = self.getEl(), openElm = self.getEl('open'), rect = self.layoutRect();

			if (openElm) {
				DomUtils.css(elm.firstChild, {
					width: rect.w - openElm.offsetWidth - 10
					//lineHeight: (self.layoutRect().h - 2) + 'px'
				});
			} else {
				DomUtils.css(elm.firstChild, {
					width: rect.w - 10
				});
			}

			self._super();

			return self;
		},

		disabled: function(state) {
			var self = this;

			self._super(state);

			if (self._rendered) {
				self.getEl().disabled = state;
			}
		},

		focus: function() {
			this.getEl('inp').focus();
		},

		postRender: function() {
			var self = this;

			DomUtils.on(this.getEl('inp'), 'change', function() {
				self.fire('change');
			});

			return self._super();
		},

		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix;
			var value = settings.value || settings.placeholder || '';
			var icon, text, openBtnHtml = '';

			icon = settings.icon ? prefix + 'ico ' + prefix + 'i-' + settings.icon : '';
			text = self._text;

			if (icon || text) {
				openBtnHtml = (
					'<div id="' + id + '-open" class="' + prefix + 'btn ' + prefix + 'open" tabIndex="-1">' +
						'<button id="' + id + '-action" hidefocus tabindex="-1">' +
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
					value + '" hidefocus="true">' +
					openBtnHtml +
				'</div>'
			);
		}
	});
});