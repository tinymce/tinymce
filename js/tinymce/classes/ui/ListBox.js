/**
 * ListBox.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less ListBox.less
 * @class tinymce.ui.ListBox
 * @extends tinymce.ui.MenuButton
 */
define("tinymce/ui/ListBox", [
	"tinymce/ui/MenuButton"
], function(MenuButton) {
	"use strict";

	return MenuButton.extend({
		init: function(settings) {
			var self = this, values, i, selected, selectedText;

			self._values = values = settings.values;
			if (values) {
				for (i = 0; i < values.length; i++) {
					selected = values[i].selected || settings.value === values[i].value;

					if (selected) {
						selectedText = selectedText || values[i].text;
						self._value = values[i].value;
					}
				}

				settings.menu = values;
			}

			settings.text = settings.text || selectedText || values[0].text;

			self._super(settings);
			self.addClass('listbox');

			self.on('select', function(e) {
				if (settings.multiple) {
					e.control.active(!e.control.active());
				} else {
					self.value(e.control.settings.value);
				}
			});
		},

		value: function(value) {
			var self = this, active, selectedText, menu, i;

			if (typeof(value) != "undefined") {
				if (self.menu) {
					self.menu.items().each(function(ctrl) {
						active = ctrl.value() === value;

						if (active) {
							selectedText = selectedText || ctrl.text();
						}

						ctrl.active(active);
					});
				} else {
					menu = self.settings.menu;
					for (i = 0; i < menu.length; i++) {
						active = menu[i].value == value;

						if (active) {
							selectedText = selectedText || menu[i].text;
						}

						menu[i].active = active;
					}
				}

				self.text(selectedText);
			}

			return self._super(value);
		}
	});
});
