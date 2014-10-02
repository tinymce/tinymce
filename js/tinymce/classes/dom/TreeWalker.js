/**
 * TreeWalker.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TreeWalker class enables you to walk the DOM in a linear manner.
 *
 * @class tinymce.dom.TreeWalker
 * @example
 * var walker = new tinymce.dom.TreeWalker(startNode);
 *
 * do {
 *     console.log(walker.current());
 * } while (walker.next());
 */
define("tinymce/dom/TreeWalker", [], function() {
	/**
	 * Constructs a new TreeWalker instance.
	 *
	 * @constructor
	 * @method TreeWalker
	 * @param {Node} startNode Node to start walking from.
	 * @param {node} rootNode Optional root node to never walk out of.
	 */
	return function(startNode, rootNode) {
		var node = startNode;

		function findSibling(node, startName, siblingName, shallow) {
			var sibling, parent;

			if (node) {
				// Walk into nodes if it has a start
				if (!shallow && node[startName]) {
					return node[startName];
				}

				// Return the sibling if it has one
				if (node != rootNode) {
					sibling = node[siblingName];
					if (sibling) {
						return sibling;
					}

					// Walk up the parents to look for siblings
					for (parent = node.parentNode; parent && parent != rootNode; parent = parent.parentNode) {
						sibling = parent[siblingName];
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
		 * @method current
		 * @return {Node} Current node where the walker is.
		 */
		this.current = function() {
			return node;
		};

		/**
		 * Walks to the next node in tree.
		 *
		 * @method next
		 * @return {Node} Current node where the walker is after moving to the next node.
		 */
		this.next = function(shallow) {
			node = findSibling(node, 'firstChild', 'nextSibling', shallow);
			return node;
		};

		/**
		 * Walks to the previous node in tree.
		 *
		 * @method prev
		 * @return {Node} Current node where the walker is after moving to the previous node.
		 */
		this.prev = function(shallow) {
			node = findSibling(node, 'lastChild', 'previousSibling', shallow);
			return node;
		};
	};
});