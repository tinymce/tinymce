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
		// AMD
		if (typeof context.define.amd === "object") {
			context.define(tinymce);
		}

		// Bolt
		if (!context.define.amd) {
			context.define("ephox/tinymce", [], tinymce);
		}
	}
	// CommonJS

	if (typeof context.module === "object" && context.module.exports) {
		context.module.exports = context.tinymce;
	}

	return {};
});
