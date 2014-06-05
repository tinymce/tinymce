/**
 * ColorPicker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Color picker widget lets you select colors.
 *
 * @-x-less ColorPicker.less
 * @class tinymce.ui.ColorPicker
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/ColorPicker", [
	"tinymce/ui/Widget",
	"tinymce/ui/DragHelper",
	"tinymce/ui/DomUtils"
], function(Widget, DragHelper, DomUtils) {
	"use strict";

	function convertToRgb(str) {
		var matches;

		if (typeof str != "string") {
			return str;
		}

		if ((matches = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)[^\)]*\)/gi.exec(str))) {
			return {
				r: parseInt(matches[1], 10),
				g: parseInt(matches[2], 10),
				b: parseInt(matches[3], 10)
			};
		}

		if ((matches = /#([0-F]{2})([0-F]{2})([0-F]{2})/gi.exec(str))) {
			return {
				r: parseInt(matches[1], 16),
				g: parseInt(matches[2], 16),
				b: parseInt(matches[3], 16)
			};
		}

		return {r: 0, g: 0, b: 0};
	}

	function toHex(rgb) {
		function hex(val) {
			val = parseInt(val, 10).toString(16);

			return val.length > 1 ? val : '0' + val;
		}

		return '#' + hex(rgb.r) + hex(rgb.g) + hex(rgb.b);
	}

	function rgb2hsv(rgb) {
		var h, s, v, r, g, b, d, minRGB, maxRGB;

		h = 0;
		s = 0;
		v = 0;
		r = rgb.r / 255;
		g = rgb.g / 255;
		b = rgb.b / 255;

		minRGB = Math.min(r, Math.min(g, b));
		maxRGB = Math.max(r, Math.max(g, b));

		if (minRGB == maxRGB) {
			v = minRGB;

			return {
				h: 0,
				s: 0,
				v: v
			};
		}

		/*eslint no-nested-ternary:0 */
		d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
		h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
		h = 60 * (h - d / (maxRGB - minRGB));
		s = (maxRGB - minRGB) / maxRGB;
		v = maxRGB;

		return {
			h: h / 360,
			s: s,
			v: v
		};
	}

	function hsvToRgb(hsv) {
		var r, g, b, h, s, v, i, f, p, q, t;
		
		s = hsv.s;
		v = hsv.v;
		h = hsv.h;
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;

			case 1:
				r = q;
				g = v;
				b = p;
				break;

			case 2:
				r = p;
				g = v;
				b = t;
				break;

			case 3:
				r = p;
				g = q;
				b = v;
				break;

			case 4:
				r = t;
				g = p;
				b = v;
				break;

			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}

		return {
			r: Math.floor(r * 255),
			g: Math.floor(g * 255),
			b: Math.floor(b * 255)
		};
	}

	return Widget.extend({
		Defaults: {
			classes: "widget colorpicker"
		},

		/**
		 * Constructs a new colorpicker instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} color Initial color value.
		 */
		init: function(settings) {
			this._super(settings);
			this.value(settings.color || '#000000');
		},

		postRender: function() {
			var self = this, rgb = self._rgb, hsv, hueRootElm, huePointElm, svRootElm, svPointElm;

			hueRootElm = self.getEl('h');
			huePointElm = self.getEl('hp');
			svRootElm = self.getEl('sv');
			svPointElm = self.getEl('svp');

			function getPos(elm, event) {
				var pos = DomUtils.getPos(elm), x, y;

				x = event.pageX - pos.x;
				y = event.pageY - pos.y;

				x = Math.max(0, Math.min(x / elm.clientWidth, 1));
				y = Math.max(0, Math.min(y / elm.clientHeight, 1));

				return {
					x: x,
					y: y
				};
			}

			function updateColor(hsv, hueUpdate) {
				DomUtils.css(huePointElm, {
					top: ((1 - hsv.h) * 100) + '%'
				});

				if (!hueUpdate) {
					DomUtils.css(svPointElm, {
						left: (hsv.s * 100) + '%',
						top: ((1 - hsv.v) * 100) + '%'
					});
				}

				svRootElm.style.background = toHex(hsvToRgb({s: 1, v: 1, h: hsv.h}));
				self._rgb = rgb = hsvToRgb(hsv);

				self.fire('update');
			}

			function updateSaturationAndValue(e) {
				var pos;

				pos = getPos(svRootElm, e);
				hsv.s = pos.x;
				hsv.v = 1 - pos.y;

				updateColor(hsv);
			}

			function updateHue(e) {
				var pos;

				pos = getPos(hueRootElm, e);
				hsv = rgb2hsv(rgb);
				hsv.h = 1 - pos.y;
				updateColor(hsv, true);
			}

			self._repaint = function(rgb) {
				hsv = rgb2hsv(rgb);
				updateColor(hsv);
			};

			self._super();

			self._svdraghelper = new DragHelper(self._id + '-sv', {
				start: updateSaturationAndValue,
				drag: updateSaturationAndValue
			});

			self._hdraghelper = new DragHelper(self._id + '-h', {
				start: updateHue,
				drag: updateHue
			});

			self._repaint(rgb);
		},

		rgb: function() {
			return this._rgb;
		},

		value: function(value) {
			var self = this;

			if (arguments.length) {
				value = self._rgb = convertToRgb(value);

				if (self._rendered) {
					self._repaint(value);
				}
			} else {
				return toHex(self._rgb);
			}
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix, hueHtml;
			var stops = '#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000';

			function getOldIeFallbackHtml() {
				var i, l, html = '', gradientPrefix, stopsList;

				gradientPrefix = 'filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=';
				stopsList = stops.split(',');
				for (i = 0, l = stopsList.length - 1; i < l; i++) {
					html += (
						'<div class="' + prefix + 'colorpicker-h-chunk" style="' +
							'height:' + (100 / l) + '%;' +
							gradientPrefix + stopsList[i] + ',endColorstr=' + stopsList[i + 1] + ');' +
							'-ms-' + gradientPrefix + stopsList[i] + ',endColorstr=' + stopsList[i + 1] + ')' +
						'"></div>'
					);
				}

				return html;
			}

			var gradientCssText = (
				'background: -ms-linear-gradient(top,' + stops + ');' +
				'background: linear-gradient(to bottom,' + stops + ');'
			);

			hueHtml = (
				'<div id="' + id + '-h" class="' + prefix + 'colorpicker-h" style="' + gradientCssText + '">' +
					getOldIeFallbackHtml() +
					'<div id="' + id + '-hp" class="' + prefix + 'colorpicker-h-marker"></div>' +
				'</div>'
			);

			return (
				'<div id="' + id + '" class="' + self.classes() + '">' +
					'<div id="' + id + '-sv" class="' + prefix + 'colorpicker-sv">' +
						'<div class="' + prefix + 'colorpicker-overlay1">' +
							'<div class="' + prefix + 'colorpicker-overlay2">' +
								'<div id="' + id + '-svp" class="' + prefix + 'colorpicker-selector1">' +
									'<div class="' + prefix + 'colorpicker-selector2"></div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
					hueHtml +
				'</div>'
			);
		}
	});
});