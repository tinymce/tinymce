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
			var self = this, values, selected, selectedText, lastItemCtrl;

			function setSelected(menuValues) {
				// Try to find a selected value
				for (var i = 0; i < menuValues.length; i++) {
					selected = menuValues[i].selected || settings.value === menuValues[i].value;

					if (selected) {
						selectedText = selectedText || menuValues[i].text;
						self._value = menuValues[i].value;
						break;
					}

					// If the value has a submenu, try to find the selected values in that menu
					if (menuValues[i].menu) {
						setSelected(menuValues[i].menu);
					}
				}
			}

			self._values = values = settings.values;
			if (values) {
				setSelected(values);

				// Default with first item
				if (!selected && values.length > 0) {
					selectedText = values[0].text;
					self._value = values[0].value;
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
			var self = this, active, selectedText, menu;

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

			function setActiveValues(menuValues) {
				for (var i = 0; i < menuValues.length; i++) {
					active = menuValues[i].value == value;

					if (active) {
						selectedText = selectedText || menuValues[i].text;
					}

					menuValues[i].active = active;

					if (menuValues[i].menu) {
						setActiveValues(menuValues[i].menu);
					}
				}
			}

			if (typeof value != "undefined") {
				if (self.menu) {
					activateByValue(self.menu, value);
				} else {
					menu = self.settings.menu;
					setActiveValues(menu);
				}

				self.text(selectedText || this.settings.text);
			}

			return self._super(value);
		}
	});
});
