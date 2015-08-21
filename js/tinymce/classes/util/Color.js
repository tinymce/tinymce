/**
 * Color.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class lets you parse/serialize colors and convert rgb/hsb.
 *
 * @class tinymce.util.Color
 * @example
 * var white = new tinymce.util.Color({r: 255, g: 255, b: 255});
 * var red = new tinymce.util.Color('#FF0000');
 *
 * console.log(white.toHex(), red.toHsv());
 */
define("tinymce/util/Color", [], function() {
	var min = Math.min, max = Math.max, round = Math.round;

	/**
	 * Constructs a new color instance.
	 *
	 * @constructor
	 * @method Color
	 * @param {String} value Optional initial value to parse.
	 */
	function Color(value) {
		var self = this, r = 0, g = 0, b = 0;

		function rgb2hsv(r, g, b) {
			var h, s, v, d, minRGB, maxRGB;

			h = 0;
			s = 0;
			v = 0;
			r = r / 255;
			g = g / 255;
			b = b / 255;

			minRGB = min(r, min(g, b));
			maxRGB = max(r, max(g, b));

			if (minRGB == maxRGB) {
				v = minRGB;

				return {
					h: 0,
					s: 0,
					v: v * 100
				};
			}

			/*eslint no-nested-ternary:0 */
			d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
			h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
			h = 60 * (h - d / (maxRGB - minRGB));
			s = (maxRGB - minRGB) / maxRGB;
			v = maxRGB;

			return {
				h: round(h),
				s: round(s * 100),
				v: round(v * 100)
			};
		}

		function hsvToRgb(hue, saturation, brightness) {
			var side, chroma, x, match;

			hue = (parseInt(hue, 10) || 0) % 360;
			saturation = parseInt(saturation, 10) / 100;
			brightness = parseInt(brightness, 10) / 100;
			saturation = max(0, min(saturation, 1));
			brightness = max(0, min(brightness, 1));

			if (saturation === 0) {
				r = g = b = round(255 * brightness);
				return;
			}

			side = hue / 60;
			chroma = brightness * saturation;
			x = chroma * (1 - Math.abs(side % 2 - 1));
			match = brightness - chroma;

			switch (Math.floor(side)) {
				case 0:
					r = chroma;
					g = x;
					b = 0;
					break;

				case 1:
					r = x;
					g = chroma;
					b = 0;
					break;

				case 2:
					r = 0;
					g = chroma;
					b = x;
					break;

				case 3:
					r = 0;
					g = x;
					b = chroma;
					break;

				case 4:
					r = x;
					g = 0;
					b = chroma;
					break;

				case 5:
					r = chroma;
					g = 0;
					b = x;
					break;

				default:
					r = g = b = 0;
			}

			r = round(255 * (r + match));
			g = round(255 * (g + match));
			b = round(255 * (b + match));
		}

		/**
		 * Returns the hex string of the current color. For example: #ff00ff
		 *
		 * @method toHex
		 * @return {String} Hex string of current color.
		 */
		function toHex() {
			function hex(val) {
				val = parseInt(val, 10).toString(16);

				return val.length > 1 ? val : '0' + val;
			}

			return '#' + hex(r) + hex(g) + hex(b);
		}

		/**
		 * Returns the r, g, b values of the color. Each channel has a range from 0-255.
		 *
		 * @method toRgb
		 * @return {Object} Object with r, g, b fields.
		 */
		function toRgb() {
			return {
				r: r,
				g: g,
				b: b
			};
		}

		/**
		 * Returns the h, s, v values of the color. Ranges: h=0-360, s=0-100, v=0-100.
		 *
		 * @method toHsv
		 * @return {Object} Object with h, s, v fields.
		 */
		function toHsv() {
			return rgb2hsv(r, g, b);
		}

		/**
		 * Parses the specified value and populates the color instance.
		 *
		 * Supported format examples:
		 *  * rbg(255,0,0)
		 *  * #ff0000
		 *  * #fff
		 *  * {r: 255, g: 0, b: 0}
		 *  * {h: 360, s: 100, v: 100}
		 *
		 * @method parse
		 * @param {Object/String} value Color value to parse.
		 * @return {tinymce.util.Color} Current color instance.
		 */
		function parse(value) {
			var matches;

			if (typeof value == 'object') {
				if ("r" in value) {
					r = value.r;
					g = value.g;
					b = value.b;
				} else if ("v" in value) {
					hsvToRgb(value.h, value.s, value.v);
				}
			} else {
				if ((matches = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)[^\)]*\)/gi.exec(value))) {
					r = parseInt(matches[1], 10);
					g = parseInt(matches[2], 10);
					b = parseInt(matches[3], 10);
				} else if ((matches = /#([0-F]{2})([0-F]{2})([0-F]{2})/gi.exec(value))) {
					r = parseInt(matches[1], 16);
					g = parseInt(matches[2], 16);
					b = parseInt(matches[3], 16);
				} else if ((matches = /#([0-F])([0-F])([0-F])/gi.exec(value))) {
					r = parseInt(matches[1] + matches[1], 16);
					g = parseInt(matches[2] + matches[2], 16);
					b = parseInt(matches[3] + matches[3], 16);
				}
			}

			r = r < 0 ? 0 : (r > 255 ? 255 : r);
			g = g < 0 ? 0 : (g > 255 ? 255 : g);
			b = b < 0 ? 0 : (b > 255 ? 255 : b);

			return self;
		}

		if (value) {
			parse(value);
		}

		self.toRgb = toRgb;
		self.toHsv = toHsv;
		self.toHex = toHex;
		self.parse = parse;
	}

	return Color;
});
