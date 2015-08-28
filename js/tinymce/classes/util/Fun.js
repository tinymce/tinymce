/**
 * Fun.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Functional utility class.
 *
 * @private
 * @class tinymce.util.Fun
 */
define("tinymce/util/Fun", [], function() {
	function constant(value) {
		return function() {
			return value;
		};
	}

	return {
		constant: constant
	};
});