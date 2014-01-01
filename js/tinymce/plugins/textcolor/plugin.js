/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('textcolor', function(editor) {
	var autocolorOption = editor.settings.textcolor_autocolor; // boolean

	function mapColors() {
		var i, l, colors = [], colorMap;

		colorMap = editor.settings.textcolor_map || [
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

		for (i = 0, l = colorMap.length; i < l; i += 2) {
			colors.push({
				text: colorMap[i + 1],
				color: colorMap[i]
			});
		}

		return colors;
	}

	function renderColorPicker() {
		var ctrl = this, colors, color, last, rows, cols, autocolorText, autocolorBar, html, x, y, i;

		colors = mapColors();
		last = colors.length - 1;
		rows = editor.settings.textcolor_rows || 5;
		cols = editor.settings.textcolor_cols || 8;
		autocolorText = ctrl.parent().settings.selectcmd === 'ForeColor' ? 'Auto' : 'None';
		autocolorBar = '<div class="mce-colorbutton-autocolor"' +
						' id="' + ctrl._id + '-auto"' +
						' data-mce-color="auto"' +
						' role="option"' +
						' tabIndex="-1">' + autocolorText +
						'</div>';

		html = (autocolorOption ? autocolorBar : '') +
			'<table class="mce-grid mce-grid-border mce-colorbutton-grid" role="presentation" cellspacing="0"><tbody>';

		for (y = 0; y < rows; y++) {
			html += '<tr>';

			for (x = 0; x < cols; x++) {
				i = y * cols + x;

				if (i > last) {
					html += '<td></td>';
				} else {
					color = colors[i];
					html += (
						'<td>' +
							'<div id="' + ctrl._id + '-' + i + '"' +
								' data-mce-color="' + color.color + '"' +
								' role="option"' +
								' tabIndex="-1"' +
								' style="' + (color ? 'background-color: #' + color.color : '') + '"' +
								' title="' + color.text + '">' +
							'</div>' +
						'</td>'
					);
				}
			}

			html += '</tr>';
		}

		html += '</tbody></table>';

		return html;
	}

	function onPanelClick(e) {
		var buttonCtrl = this.parent(), value;
		var targetValue = e.target.getAttribute('data-mce-color');
		var styleName, formatName;

		if (targetValue) {
			buttonCtrl.hidePanel();
			value = targetValue === 'auto' ? targetValue : '#' + targetValue;
			buttonCtrl.color(value);
			formatName = buttonCtrl.settings.selectcmd.toLowerCase();

			if (autocolorOption) {
				if (value === 'auto') {
					styleName = formatName === 'forecolor' ? 'color' : 'backgroundColor';
					editor.formatter.remove(formatName, false, false, styleName);
				} else {
					editor.formatter.apply(formatName, {'value': value});
				}

				editor.focus(); // added for performCaretAction
				editor.save();

			} else {
				editor.execCommand(formatName, false, value);

			}
		}
	}

	function onButtonClick() {
		var self = this;
		var buttonColor = self.color();
		var styleName, formatName = self.settings.selectcmd.toLowerCase();

		if (autocolorOption) {
			if (!buttonColor || buttonColor === 'auto') { // removing color is autocolorOption's default
				styleName = formatName === 'forecolor' ? 'color' : 'backgroundColor';
				editor.formatter.remove(formatName, false, false, styleName);
			} else {
				editor.formatter.apply(formatName, {'value': buttonColor});
			}

			editor.save();

		} else if (buttonColor) {
			editor.execCommand(formatName, false, buttonColor);

		}
	}

	editor.addButton('forecolor', {
		type: 'colorbutton',
		tooltip: 'Text color',
		selectcmd: 'ForeColor',
		panel: {
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick
	});

	editor.addButton('backcolor', {
		type: 'colorbutton',
		tooltip: 'Background color',
		selectcmd: 'HiliteColor',
		panel: {
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick
	});
});
