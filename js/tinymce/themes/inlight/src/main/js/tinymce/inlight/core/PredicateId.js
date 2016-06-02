/**
 * PredicateId.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/PredicateId', [
	'global!tinymce.util.Tools'
], function (Tools) {
	// fromContextToolbars :: [ContextToolbar] -> [PredicateId]
	var fromContextToolbars = function (toolbars) {
		return Tools.map(toolbars, function (toolbar) {
			return {
				predicate: toolbar.predicate,
				id: toolbar.id
			};
		});
	};

	return {
		fromContextToolbars: fromContextToolbars
	};
});
