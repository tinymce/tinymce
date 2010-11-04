/**
 * Range.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.dom.RangeUtils = function(dom) {
		var INVISIBLE_CHAR = '\uFEFF';

		/**
		 * Walks the specified range like object and executes the callback for each sibling collection it finds.
		 *
		 * @param {Object} rng Range like object.
		 * @param {function} callback Callback function to execute for each sibling collection.
		 */
		this.walk = function(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mceSelected,th.mceSelected');
			if (nodes.length > 0) {
				tinymce.each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			/**
			 * Collects siblings
			 *
			 * @private
			 * @param {Node} node Node to collect siblings from.
			 * @param {String} name Name of the sibling to check for.
			 * @return {Array} Array of collected siblings.
			 */
			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name])
					siblings.push(node);

				return siblings;
			};

			/**
			 * Find an end point this is the node just before the common ancestor root.
			 *
			 * @private
			 * @param {Node} node Node to start at.
			 * @param {Node} root Root/ancestor element to stop just before.
			 * @return {Node} Node just before the root element.
			 */
			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root)
						return node;

					node = node.parentNode;
				} while(node);
			};

			function walkBoundary(start_node, end_node, next) {
				var siblingName = next ? 'nextSibling' : 'previousSibling';

				for (node = start_node, parent = node.parentNode; node && node != end_node; node = parent) {
					parent = node.parentNode;
					siblings = collectSiblings(node == start_node ? node : node[siblingName], siblingName);

					if (siblings.length) {
						if (!next)
							siblings.reverse();

						callback(siblings);
					}
				}
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[startOffset];

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes())
				endContainer = endContainer.childNodes[Math.min(endOffset - 1, endContainer.childNodes.length - 1)];

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);

			// Same container
			if (startContainer == endContainer)
				return callback([startContainer]);

			// Process left side
			for (node = startContainer; node; node = node.parentNode) {
				if (node == endContainer)
					return walkBoundary(startContainer, ancestor, true);

				if (node == ancestor)
					break;
			}

			// Process right side
			for (node = endContainer; node; node = node.parentNode) {
				if (node == startContainer)
					return walkBoundary(endContainer, ancestor);

				if (node == ancestor)
					break;
			}

			// Find start/end point
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			walkBoundary(startContainer, startPoint, true);

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length)
				callback(siblings);

			// Walk right leaf
			walkBoundary(endContainer, endPoint);
		};

		/**
		 * Splits the specified range at it's start/end points.
		 *
		 * @param {Range/RangeObject} rng Range to split.
		 * @return {Object} Range position object.
		 */
/*		this.split = function(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			function splitText(node, offset) {
				if (offset == node.nodeValue.length)
					node.appendData(INVISIBLE_CHAR);

				node = node.splitText(offset);

				if (node.nodeValue === INVISIBLE_CHAR)
					node.nodeValue = '';

				return node;
			};

			// Handle single text node
			if (startContainer == endContainer) {
				if (startContainer.nodeType == 3) {
					if (startOffset != 0)
						startContainer = endContainer = splitText(startContainer, startOffset);

					if (endOffset - startOffset != startContainer.nodeValue.length)
						splitText(startContainer, endOffset - startOffset);
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset != 0) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset != endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};
*/
	};

	/**
	 * Compares two ranges and checks if they are equal.
	 *
	 * @static
	 * @param {DOMRange} rng1 First range to compare.
	 * @param {DOMRange} rng2 First range to compare.
	 * @return {Boolean} true/false if the ranges are equal.
	 */
	tinymce.dom.RangeUtils.compareRanges = function(rng1, rng2) {
		if (rng1 && rng2) {
			// Compare native IE ranges
			if (rng1.item || rng1.duplicate) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return true;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return true;
			} else {
				// Compare w3c ranges
				return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
			}
		}

		return false;
	};
})(tinymce);
