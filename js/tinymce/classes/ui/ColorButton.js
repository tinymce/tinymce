/**
 * ColorButton.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less ColorButton.less
 * @class tinymce.ui.ColorButton
 * @extends tinymce.ui.MenuButton
 */
define("tinymce/ui/ColorButton", [
	"tinymce/ui/Button",
	"tinymce/ui/FloatPanel",
	"tinymce/ui/KeyboardNavigation"
], function(Button, FloatPanel, KeyboardNavigation) {
	"use strict";

	function mapColors() {
		var i, colors = [], colorMap;

		colorMap = [
			"000000", "Black",
			"993300", "Burnt orange",
			"333300", "Dark olive",
			"003300", "Dark green",
			"003366", "Dark azure",
			"000080", "Navy Blue",
			"333399", "Indigo",
			"333333", "Very dark gray",
			"800000", "Maroon",
			"FF6600", "Orange",
			"808000", "Olive",
			"008000", "Green",
			"008080", "Teal",
			"0000FF", "Blue",
			"666699", "Grayish blue",
			"808080", "Gray",
			"FF0000", "Red",
			"FF9900", "Amber",
			"99CC00", "Yellow green",
			"339966", "Sea green",
			"33CCCC", "Turquoise",
			"3366FF", "Royal blue",
			"800080", "Purple",
			"999999", "Medium gray",
			"FF00FF", "Magenta",
			"FFCC00", "Gold",
			"FFFF00", "Yellow",
			"00FF00", "Lime",
			"00FFFF", "Aqua",
			"00CCFF", "Sky blue",
			"993366", "Brown",
			"C0C0C0", "Silver",
			"FF99CC", "Pink",
			"FFCC99", "Peach",
			"FFFF99", "Light yellow",
			"CCFFCC", "Pale green",
			"CCFFFF", "Pale cyan",
			"99CCFF", "Light sky blue",
			"CC99FF", "Plum",
			"FFFFFF", "White"
		];

		for (i = 0; i < colorMap.length; i += 2) {
			colors.push({
				text: colorMap[i + 1],
				color: colorMap[i]
			});
		}

		return colors;
	}

	return Button.extend({
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('colorbutton');
			self.on('click', function(e) {
				if (e.control == self) {
					self.showPicker();
				}
			});
			self.hasPopup = true;
		},

		showPicker: function() {
			var self = this, html = '', size, x, y, prefix = self.classPrefix, colors;

			if (!self.picker) {
				colors = mapColors();

				html = '<table class="' + prefix + 'grid ' + prefix + 'colorbutton-grid" role="presentation" cellspacing="0"><tbody>';
				size = Math.ceil(Math.sqrt(colors.length));

				for (y = 0; y < 5; y++) {
					html += '<tr>';

					for (x = 0; x < 8; x++) {
						var color = colors[y * 8 + x];

						html += (
							'<td>' +
								'<div id="' + self._id + '-' + (y * 8 + x) + '"' +
									' data-mce-color="' + color.color + '"' +
									' role="option"' +
									' tabIndex="-1"' +
									' style="' + (color ? 'background-color: #' + color.color : '') + '"' +
									' title="' + color.text + '">' +
								'</div>' +
							'</td>'
						);
					}

					html += '</tr>';
				}

				html += '</tbody></table>';

				self.picker = new FloatPanel({
					popover: true,
					autohide: true,
					html: html,
					border: 1,
					classes: 'colorpicker'
				}).parent(self).renderTo(self.getContainerElm());

				self.picker._hasBody = false;
				self.picker.reflow();
				self.picker.parent(self);
				self.picker.on('cancel', function(e) {
					if (e.control === self.menu) {
						self.focus();
					}
				});
				self.picker.on('click', function(e) {
					var value;

					if ((value = e.target.getAttribute('data-mce-color'))) {
						self.picker.hide();
						value = '#' + value;
						self.showPreview(value);
						self.fire('select', {value: value});
					}
				});

				self.keyboardNavigation = new KeyboardNavigation({
					root: self.picker,
					items: self.picker.getEl().getElementsByTagName('div'),
					onCancel: function() {
						self.picker.hide();
						self.fire('cancel');
					}
				});
			}

			self.picker.show();
			self.picker.moveRel(self.getEl(), 'bc-tl');
			self.keyboardNavigation.focusFirst();
		},

		showPreview: function(color) {
			this.getEl('preview').style.backgroundColor = color;
		},

		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
			var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1">' +
					'<button role="presentation" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						'<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
						(self._text ? (icon ? ' ' : '') + self.encode(self._text) : '') +
					'</button>' +
				'</div>'
			);
		}
	});
});