/**
 * Radio.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new radio button.
 *
 * @-x-less Radio.less
 * @class tinymce.core.ui.Radio
 * @extends tinymce.core.ui.Checkbox
 */
define("tinymce.core.ui.Radio", [
	"tinymce.core.ui.Checkbox"
], function(Checkbox) {
	"use strict";

	return Checkbox.extend({
		Defaults: {
			classes: "radio",
			role: "radio"
		}
	});
});