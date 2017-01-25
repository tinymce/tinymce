/**
 * FontInfo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class for computing font size for elements.
 *
 * @private
 * @class tinymce.fmt.FontInfo
 */
define("tinymce/fmt/FontInfo", [
	"tinymce/dom/DOMUtils"
], function(DOMUtils) {
	var getSpecifiedFontProp = function (propName, rootElm, elm) {
		while (elm !== rootElm) {
			if (elm.style[propName]) {
				return elm.style[propName];
			}

			elm = elm.parentNode;
		}

		return '';
	};

	var toPt = function (fontSize) {
		if (/[0-9.]+px$/.test(fontSize)) {
			return Math.round(parseInt(fontSize, 10) * 72 / 96) + 'pt';
		}

		return fontSize;
	};

	var normalizeFontFamily = function (fontFamily) {
		// 'Font name', Font -> Font name,Font
		return fontFamily.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
	};

	var getComputedFontProp = function (propName, elm) {
		return DOMUtils.DOM.getStyle(elm, propName, true);
	};

	var getFontSize = function (rootElm, elm) {
		var specifiedFontSize = getSpecifiedFontProp('fontSize', rootElm, elm);
		return specifiedFontSize !== '' ? specifiedFontSize : getComputedFontProp('fontSize', elm);
	};

	var getFontFamily = function (rootElm, elm) {
		var specifiedFontSize = getSpecifiedFontProp('fontFamily', rootElm, elm);
		var fontValue = specifiedFontSize !== '' ? specifiedFontSize : getComputedFontProp('fontFamily', elm);

		return fontValue !== undefined ? normalizeFontFamily(fontValue) : '';
	};

	return {
		getFontSize: getFontSize,
		getFontFamily: getFontFamily,
		toPt: toPt
	};
});
