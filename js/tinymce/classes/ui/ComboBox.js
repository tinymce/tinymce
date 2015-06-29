/**
 * ComboBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/ui/Factory",
	"tinymce/ui/DomUtils",
	"tinymce/dom/DomQuery"
], function(Widget, Factory, DomUtils, $) {
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
			settings = self.settings;

			self.classes.add('combobox');
			self.subinput = true;
			self.ariaTarget = 'inp'; // TODO: Figure out a better way

			settings.menu = settings.menu || settings.values;

			if (settings.menu) {
				settings.icon = 'caret';
			}

			self.on('click', function(e) {
				var elm = e.target, root = self.getEl();

				if (!$.contains(root, elm) && elm != root) {
					return;
				}

				while (elm && elm != root) {
					if (elm.id && elm.id.indexOf('-open') != -1) {
						self.fire('action');

						if (settings.menu) {
							self.showMenu();

							if (e.aria) {
								self.menu.items()[0].focus();
							}
						}
					}

					elm = elm.parentNode;
				}
			});

			// TODO: Rework this
			self.on('keydown', function(e) {
				if (e.target.nodeName == "INPUT" && e.keyCode == 13) {
					self.parents().reverse().each(function(ctrl) {
						var stateValue = self.state.get('value'), inputValue = self.getEl('inp').value;

						e.preventDefault();

						self.state.set('value', inputValue);

						if (stateValue != inputValue) {
							self.fire('change');
						}

						if (ctrl.hasEventListeners('submit') && ctrl.toJSON) {
							ctrl.fire('submit', {data: ctrl.toJSON()});
							return false;
						}
					});
				}
			});

			self.on('keyup', function(e) {
				if (e.target.nodeName == "INPUT") {
					self.state.set('value', e.target.value);
				}
			});
		},

		showMenu: function() {
			var self = this, settings = self.settings, menu;

			if (!self.menu) {
				menu = settings.menu || [];

				// Is menu array then auto constuct menu control
				if (menu.length) {
					menu = {
						type: 'menu',
						items: menu
					};
				} else {
					menu.type = menu.type || 'menu';
				}

				self.menu = Factory.create(menu).parent(self).renderTo(self.getContainerElm());
				self.fire('createmenu');
				self.menu.reflow();
				self.menu.on('cancel', function(e) {
					if (e.control === self.menu) {
						self.focus();
					}
				});

				self.menu.on('show hide', function(e) {
					e.control.items().each(function(ctrl) {
						ctrl.active(ctrl.value() == self.value());
					});
				}).fire('show');

				self.menu.on('select', function(e) {
					self.value(e.control.value());
				});

				self.on('focusin', function(e) {
					if (e.target.tagName.toUpperCase() == 'INPUT') {
						self.menu.hide();
					}
				});

				self.aria('expanded', true);
			}

			self.menu.show();
			self.menu.layoutRect({w: self.layoutRect().w});
			self.menu.moveRel(self.getEl(), self.isRtl() ? ['br-tr', 'tr-br'] : ['bl-tl', 'tl-bl']);
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

			$(elm.firstChild).css({
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

			$(this.getEl('inp')).on('change', function(e) {
				self.state.set('value', e.target.value);
				self.fire('change', e);
			});

			return self._super();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, settings = self.settings, prefix = self.classPrefix;
			var value = self.state.get('value') || '';
			var icon, text, openBtnHtml = '', extraAttrs = '';

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

			icon = settings.icon;
			if (icon && icon != 'caret') {
				icon = prefix + 'ico ' + prefix + 'i-' + settings.icon;
			}

			text = self.state.get('text');

			if (icon || text) {
				openBtnHtml = (
					'<div id="' + id + '-open" class="' + prefix + 'btn ' + prefix + 'open" tabIndex="-1" role="button">' +
						'<button id="' + id + '-action" type="button" hidefocus="1" tabindex="-1">' +
							(icon != 'caret' ? '<i class="' + icon + '"></i>' : '<i class="' + prefix + 'caret"></i>') +
							(text ? (icon ? ' ' : '') + text : '') +
						'</button>' +
					'</div>'
				);

				self.classes.add('has-open');
			}

			return (
				'<div id="' + id + '" class="' + self.classes + '">' +
					'<input id="' + id + '-inp" class="' + prefix + 'textbox" value="' +
					self.encode(value, false) + '" hidefocus="1"' + extraAttrs + ' placeholder="' +
					self.encode(settings.placeholder) + '" />' +
					openBtnHtml +
				'</div>'
			);
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:value', function(e) {
				self.getEl('inp').value = e.value;
			});

			self.state.on('change:disabled', function(e) {
				self.getEl('inp').disabled = e.value;
			});

			return self._super();
		},

		remove: function() {
			$(this.getEl('inp')).off();
			this._super();
		}
	});
});