/**
 * NodePath.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles paths of nodes within an element.
 *
 * @private
 * @class tinymce.dom.NodePath
 */
define("tinymce/dom/NodePath", [
	"tinymce/dom/DOMUtils"
], function(DOMUtils) {
	function create(rootNode, targetNode, normalized) {
		var path = [];

		for (; targetNode && targetNode != rootNode; targetNode = targetNode.parentNode) {
			path.push(DOMUtils.nodeIndex(targetNode, normalized));
		}

		return path;
	}

	function resolve(rootNode, path) {
		var i, node, children;

		for (node = rootNode, i = path.length - 1; i >= 0; i--) {
			children = node.childNodes;

			if (path[i] > children.length - 1) {
				return null;
			}

			node = children[path[i]];
		}

		return node;
	}

	return {
		create: create,
		resolve: resolve
	};
});