/**
 * Selection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce.lists.core.Selection", [
	"global!tinymce.util.Tools",
	"tinymce.lists.core.NodeType"
], function (Tools, NodeType) {
	var getSelectedListItems = function (editor) {
		return Tools.grep(editor.selection.getSelectedBlocks(), function (block) {
			return NodeType.isListItemNode(block);
		});
	};

	return {
		getSelectedListItems: getSelectedListItems
	};
});

