/**
 * ListBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new list box control.
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
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Array} values Array with values to add to list box.
		 */
		init: function(settings) {
			var self = this, values, i, selected, selectedText, lastItemCtrl;

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
				var ctrl = e.control;

				if (lastItemCtrl) {
					e.lastControl = lastItemCtrl;
				}

				if (settings.multiple) {
					ctrl.active(!ctrl.active());
				} else {
					self.value(e.control.settings.value);
				}

				lastItemCtrl = ctrl;
			});
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {Boolean/tinymce.ui.ListBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this, active, selectedText, menu, i;

			function activateByValue(menu, value) {
				menu.items().each(function(ctrl) {
					active = ctrl.value() === value;

					if (active) {
						selectedText = selectedText || ctrl.text();
					}

					ctrl.active(active);

					if (ctrl.menu) {
						activateByValue(ctrl.menu, value);
					}
				});
			}

			if (typeof(value) != "undefined") {
				if (self.menu) {
					activateByValue(self.menu, value);
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

				self.text(selectedText || this.settings.text);
			}

			return self._super(value);
		}
	});
});
