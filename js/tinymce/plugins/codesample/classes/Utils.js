/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Various utility functions.
 *
 * @class tinymce.codesample.Utils
 * @private
 */
define("tinymce/codesampleplugin/Utils", [
], function() {
	function isCodeSample(elm) {
		return elm && elm.nodeName == 'PRE' && elm.className.indexOf('language-') !== -1;
	}

	function trimArg(predicateFn) {
		return function(arg1, arg2) {
			return predicateFn(arg2);
		};
	}

	return {
		isCodeSample: isCodeSample,
		trimArg: trimArg
	};
});