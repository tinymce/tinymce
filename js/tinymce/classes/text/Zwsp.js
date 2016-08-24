/**
 * Zwsp.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with zero width space
 * characters used as character containers etc.
 *
 * @private
 * @class tinymce.text.Zwsp
 * @example
 * var isZwsp = Zwsp.isZwsp('\uFEFF');
 * var abc = Zwsp.trim('a\uFEFFc');
 */
define("tinymce/text/Zwsp", [], function() {
	var ZWSP = '\uFEFF';

	function isZwsp(chr) {
		return chr == ZWSP;
	}

	function trim(str) {
		return str.replace(new RegExp(ZWSP, 'g'), '');
	}

	return {
		isZwsp: isZwsp,
		ZWSP: ZWSP,
		trim: trim
	};
});