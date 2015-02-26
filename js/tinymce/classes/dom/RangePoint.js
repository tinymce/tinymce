/**
 * RangePoint.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/dom/RangePoint", [
	"tinymce/dom/TreeWalker"
], function(TreeWalker) {
	function RangePoint(container, offset, dom) {
		function walk(forward) {
			var nonEmptyElements, current, walker;

			function isInlineBlockElement(node) {
				return node.nodeName != 'BR' && nonEmptyElements[node.nodeName];
			}

			function updateContainerAndOffset() {
				if (current.nodeType == 3) {
					container = current;
					offset = forward ? 0 : current.data.length;
				} else {
					container = current.parentNode;
					offset = dom.nodeIndex(current);

					if (forward) {
						offset++;
					}
				}
			}

			if (container.nodeType == 1 && container.hasChildNodes()) {
				if (offset >= container.childNodes.length) {
					offset = container.childNodes.length - 1;
				}

				current = container.childNodes[offset];
			} else {
				current = container;
			}

			walker = new TreeWalker(current, dom.getRoot());

			if (current.nodeType == 3) {
				if (forward) {
					if (offset < current.data.length) {
						offset++;
						return true;
					}
				} else if (offset > 0) {
					offset--;
					return true;
				}
			}

			nonEmptyElements = dom.schema.getNonEmptyElements();

			if (isInlineBlockElement(current)) {
				updateContainerAndOffset();
				return true;
			}

			while (walker[forward ? "next" : "prev"]()) {
				current = walker.current();

				// Always place caret before BR
				if (current.nodeName == 'BR') {
					container = current.parentNode;
					offset = dom.nodeIndex(current);
					return true;
				}

				// IMG, INPUT etc
				if (nonEmptyElements[current.nodeName]) {
					updateContainerAndOffset();
					return true;
				}

				// Text node
				if (current.nodeType == 3 && current.data.length > 0) {
					updateContainerAndOffset();
					return true;
				}
			}

			return false;
		}

		return {
			getOffset: function() {
				return offset;
			},

			getContainer: function() {
				return container;
			},

			/**
			 * Walks to the previous caret position.
			 *
			 * @return {Boolean} State if the range point was moved or not.
			 */
			prev: function() {
				return walk(false);
			},

			/**
			 * Walks to the next caret position.
			 *
			 * @return {Boolean} State if the range point was moved or not.
			 */
			next: function() {
				return walk(true);
			}
		};
	}

	return RangePoint;
});
