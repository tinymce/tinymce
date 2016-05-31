/**
 * Matcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/Matcher', [
], function () {
	var match = function (toolbars, elements) {
		for (var i = 0; i < elements.length; i++) {
			for (var x = 0; x < toolbars.length; x++) {
				if (toolbars[x].predicate(elements[i])) {
					return {
						toolbar: toolbars[x],
						element: elements[i]
					};
				}
			}
		}

		return null;
	};

	return {
		match: match
	};
});
