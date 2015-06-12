/**
 * BoxUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for box parsing and measuing.
 *
 * @class tinymce.ui.BoxUtils
 */
define("tinymce/ui/BoxUtils", [
], function() {
	"use strict";

	return {
		/**
		 * Parses the specified box value. A box value contains 1-4 properties in clockwise order.
		 *
		 * @method parseBox
		 * @param {String/Number} value Box value "0 1 2 3" or "0" etc.
		 * @return {Object} Object with top/right/bottom/left properties.
		 * @private
		 */
		parseBox: function(value) {
			var len, radix = 10;

			if (!value) {
				return;
			}

			if (typeof value === "number") {
				value = value || 0;

				return {
					top: value,
					left: value,
					bottom: value,
					right: value
				};
			}

			value = value.split(' ');
			len = value.length;

			if (len === 1) {
				value[1] = value[2] = value[3] = value[0];
			} else if (len === 2) {
				value[2] = value[0];
				value[3] = value[1];
			} else if (len === 3) {
				value[3] = value[1];
			}

			return {
				top: parseInt(value[0], radix) || 0,
				right: parseInt(value[1], radix) || 0,
				bottom: parseInt(value[2], radix) || 0,
				left: parseInt(value[3], radix) || 0
			};
		},

		measureBox: function(elm, prefix) {
			function getStyle(name) {
				var defaultView = document.defaultView;

				if (defaultView) {
					// Remove camelcase
					name = name.replace(/[A-Z]/g, function(a) {
						return '-' + a;
					});

					return defaultView.getComputedStyle(elm, null).getPropertyValue(name);
				}

				return elm.currentStyle[name];
			}

			function getSide(name) {
				var val = parseFloat(getStyle(name), 10);

				return isNaN(val) ? 0 : val;
			}

			return {
				top: getSide(prefix + "TopWidth"),
				right: getSide(prefix + "RightWidth"),
				bottom: getSide(prefix + "BottomWidth"),
				left: getSide(prefix + "LeftWidth")
			};
		}
	};
});