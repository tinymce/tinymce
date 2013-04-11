/**
 * TreeWalker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/dom/TreeWalker", [], function() {
	return function(start_node, root_node) {
		var node = start_node;

		function findSibling(node, start_name, sibling_name, shallow) {
			var sibling, parent;

			if (node) {
				// Walk into nodes if it has a start
				if (!shallow && node[start_name]) {
					return node[start_name];
				}

				// Return the sibling if it has one
				if (node != root_node) {
					sibling = node[sibling_name];
					if (sibling) {
						return sibling;
					}

					// Walk up the parents to look for siblings
					for (parent = node.parentNode; parent && parent != root_node; parent = parent.parentNode) {
						sibling = parent[sibling_name];
						if (sibling) {
							return sibling;
						}
					}
				}
			}
		}

		/**
		 * Returns the current node.
		 *
		 * @return {Node} Current node where the walker is.
		 */
		this.current = function() {
			return node;
		};

		/**
		 * Walks to the next node in tree.
		 *
		 * @return {Node} Current node where the walker is after moving to the next node.
		 */
		this.next = function(shallow) {
			node = findSibling(node, 'firstChild', 'nextSibling', shallow);
			return node;
		};

		/**
		 * Walks to the previous node in tree.
		 *
		 * @return {Node} Current node where the walker is after moving to the previous node.
		 */
		this.prev = function(shallow) {
			node = findSibling(node, 'lastChild', 'previousSibling', shallow);
			return node;
		};
	};
});