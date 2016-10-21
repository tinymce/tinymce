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
	"tinymce/dom/DomQuery",
	"tinymce/util/VK",
	"tinymce/util/Tools"
], function(Widget, Factory, DomUtils, $, VK, Tools) {
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
				var rootControl;

				if (e.keyCode == 13 && e.target.nodeName === 'INPUT') {
					e.preventDefault();

					// Find root control that we can do toJSON on
					self.parents().reverse().each(function(ctrl) {
						if (ctrl.toJSON) {
							rootControl = ctrl;
							return false;
						}
					});

					// Fire event on current text box with the serialized data of the whole form
					self.fire('submit', {data: rootControl.toJSON()});
				}
			});

			self.on('keyup', function(e) {
				if (e.target.nodeName == "INPUT") {
					var oldValue = self.state.get('value');
					var newValue = e.target.value;

					if (newValue !== oldValue) {
						self.state.set('value', newValue);
						self.fire('autocomplete', e);
					}
				}
			});

			self.on('mouseover', function(e) {
				var tooltip = self.tooltip().moveTo(-0xFFFF);

				if (self.statusLevel() && e.target.className.indexOf(self.classPrefix + 'status') !== -1) {
					var statusMessage = self.statusMessage() || 'Ok';
					var rel = tooltip.text(statusMessage).show().testMoveRel(e.target, ['bc-tc', 'bc-tl', 'bc-tr']);

					tooltip.classes.toggle('tooltip-n', rel == 'bc-tc');
					tooltip.classes.toggle('tooltip-nw', rel == 'bc-tl');
					tooltip.classes.toggle('tooltip-ne', rel == 'bc-tr');

					tooltip.moveRel(e.target, rel);
				}
			});
		},

		statusLevel: function (value) {
			if (arguments.length > 0) {
				this.state.set('statusLevel', value);
			}

			return this.state.get('statusLevel');
		},

		statusMessage: function (value) {
			if (arguments.length > 0) {
				this.state.set('statusMessage', value);
			}

			return this.state.get('statusMessage');
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
			var width, lineHeight, innerPadding = 0, inputElm = elm.firstChild;

			if (self.statusLevel() && self.statusLevel() !== 'none') {
				innerPadding = (
					parseInt(DomUtils.getRuntimeStyle(inputElm, 'padding-right'), 10) -
					parseInt(DomUtils.getRuntimeStyle(inputElm, 'padding-left'), 10)
				);
			}

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

			$(inputElm).css({
				width: width - innerPadding,
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
			var icon, text, openBtnHtml = '', extraAttrs = '', statusHtml = '';

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

			statusHtml = '<i id="' + id + '-status" class="mce-status mce-ico" style="display: none"></i>';

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
					statusHtml +
					openBtnHtml +
				'</div>'
			);
		},

		value: function(value) {
			if (arguments.length) {
				this.state.set('value', value);
				return this;
			}

			// Make sure the real state is in sync
			if (this.state.get('rendered')) {
				this.state.set('value', this.getEl('inp').value);
			}

			return this.state.get('value');
		},

		showAutoComplete: function (items, term) {
			var self = this;

			if (items.length === 0) {
				self.hideMenu();
				return;
			}

			var insert = function (value, title) {
				return function () {
					self.fire('selectitem', {
						title: title,
						value: value
					});
				};
			};

			if (self.menu) {
				self.menu.items().remove();
			} else {
				self.menu = Factory.create({
					type: 'menu',
					classes: 'combobox-menu',
					layout: 'flow'
				}).parent(self).renderTo();
			}

			Tools.each(items, function (item) {
				self.menu.add({
					text: item.title,
					url: item.previewUrl,
					match: term,
					classes: 'menu-item-ellipsis',
					onclick: insert(item.value, item.title)
				});
			});

			self.menu.renderNew();
			self.hideMenu();

			self.menu.on('cancel', function(e) {
				if (e.control.parent() === self.menu) {
					e.stopPropagation();
					self.focus();
					self.hideMenu();
				}
			});

			self.menu.on('select', function() {
				self.focus();
			});

			var maxW = self.layoutRect().w;
			self.menu.layoutRect({w: maxW, minW: 0, maxW: maxW});
			self.menu.reflow();
			self.menu.show();
			self.menu.moveRel(self.getEl(), self.isRtl() ? ['br-tr', 'tr-br'] : ['bl-tl', 'tl-bl']);
		},

		hideMenu: function() {
			if (this.menu) {
				this.menu.hide();
			}
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:value', function(e) {
				if (self.getEl('inp').value != e.value) {
					self.getEl('inp').value = e.value;
				}
			});

			self.state.on('change:disabled', function(e) {
				self.getEl('inp').disabled = e.value;
			});

			self.state.on('change:statusLevel', function(e) {
				var statusIconElm = self.getEl('status');
				var prefix = self.classPrefix, value = e.value;

				DomUtils.css(statusIconElm, 'display', value === 'none' ? 'none' : '');
				DomUtils.toggleClass(statusIconElm, prefix + 'i-checkmark', value === 'ok');
				DomUtils.toggleClass(statusIconElm, prefix + 'i-warning', value === 'warn');
				DomUtils.toggleClass(statusIconElm, prefix + 'i-error', value === 'error');
				self.classes.toggle('has-status', value !== 'none');
				self.repaint();
			});

			DomUtils.on(self.getEl('status'), 'mouseleave', function () {
				self.tooltip().hide();
			});

			self.on('cancel', function (e) {
				if (self.menu && self.menu.visible()) {
					e.stopPropagation();
					self.hideMenu();
				}
			});

			var focusIdx = function (idx, menu) {
				if (menu && menu.items().length > 0) {
					menu.items().eq(idx)[0].focus();
				}
			};

			self.on('keydown', function (e) {
				var keyCode = e.keyCode;

				if (e.target.nodeName === 'INPUT') {
					if (keyCode === VK.DOWN) {
						e.preventDefault();
						self.fire('autocomplete');
						focusIdx(0, self.menu);
					} else if (keyCode === VK.UP) {
						e.preventDefault();
						focusIdx(-1, self.menu);
					}
				}
			});

			return self._super();
		},

		remove: function() {
			$(this.getEl('inp')).off();

			if (this.menu) {
				this.menu.remove();
			}

			this._super();
		}
	});
});