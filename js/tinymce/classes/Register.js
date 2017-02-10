/**
 * Register.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This registers tinymce in common module loaders.
 *
 * @private
 * @class tinymce.Register
 */
define("tinymce/Register", [
], function() {
	/*eslint consistent-this: 0 */
	var context = this || window;

	var tinymce = function() {
		return context.tinymce;
	};

	if (typeof context.define === "function") {
		// Bolt
		if (!context.define.amd) {
			context.define("ephox/tinymce", [], tinymce);
		}
	}

	if (typeof module === 'object') {
		/* global module */
		module.exports = window.tinymce;
	}

	return {};
});
