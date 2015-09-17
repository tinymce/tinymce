/**
 * CaretUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions shared by the caret logic.
 *
 * @private
 * @class tinymce.caret.CaretUtils
 */
define("tinymce/caret/CaretUtils", [
	"tinymce/util/Fun",
	"tinymce/dom/TreeWalker",
	"tinymce/dom/NodeType",
	"tinymce/dom/DOMUtils",
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretContainer",
	"tinymce/caret/CaretCandidate"
], function(Fun, TreeWalker, NodeType, DOMUtils, CaretPosition, CaretContainer, CaretCandidate) {
	var isContentEditableTrue = NodeType.isContentEditableTrue,
		isContentEditableFalse = NodeType.isContentEditableFalse,
		isBlockLike = NodeType.matchStyleValues('display', 'block table table-cell table-caption'),
		nodeIndex = DOMUtils.nodeIndex,
		isCaretContainer = CaretContainer.isCaretContainer,
		curry = Fun.curry,
		isElement = NodeType.isElement;

	function isForwards(direction) {
		return direction > 0;
	}

	function isBackwards(direction) {
		return direction < 0;
	}

	function findNode(node, direction, predicateFn, rootNode, shallow) {
		var walker = new TreeWalker(node, rootNode);

		if (isBackwards(direction)) {
			while ((node = walker.prev(shallow))) {
				if (predicateFn(node)) {
					return node;
				}
			}
		}

		if (isForwards(direction)) {
			while ((node = walker.next(shallow))) {
				if (predicateFn(node)) {
					return node;
				}
			}
		}

		return null;
	}

	function getEditingHost(node, rootNode) {
		for (node = node.parentNode; node && node != rootNode; node = node.parentNode) {
			if (isContentEditableTrue(node)) {
				return node;
			}
		}

		return rootNode;
	}

	function getParentBlock(node, rootNode) {
		while (node && node != rootNode) {
			if (isBlockLike(node)) {
				return node;
			}

			node = node.parentNode;
		}

		return null;
	}

	function isInSameBlock(caretPosition1, caretPosition2, rootNode) {
		return getParentBlock(caretPosition1.container(), rootNode) == getParentBlock(caretPosition2.container(), rootNode);
	}

	function isInSameEditingHost(caretPosition1, caretPosition2, rootNode) {
		return getEditingHost(caretPosition1.container(), rootNode) == getEditingHost(caretPosition2.container(), rootNode);
	}

	function getOuterCaretPosition(direction, caretPosition) {
		var container, offset;

		container = caretPosition.container();
		offset = caretPosition.offset();

		if (isCaretContainer(container.parentNode)) {
			offset = nodeIndex(container.parentNode);
			container = container.parentNode.parentNode;

			if (isForwards(direction)) {
				offset++;
			}

			return CaretPosition(container, offset);
		}

		if (NodeType.isText(container) && CaretContainer.isCaretContainer(container)) {
			offset = nodeIndex(container);
			container = container.parentNode;

			if (isForwards(direction)) {
				offset++;
			}

			return CaretPosition(container, offset);
		}

		return caretPosition;
	}

	function getChildNodeAtRelativeOffset(relativeOffset, caretPosition) {
		var container, offset;

		if (!caretPosition) {
			return null;
		}

		container = caretPosition.container();
		offset = caretPosition.offset();

		if (!isElement(container)) {
			return null;
		}

		return container.childNodes[offset + relativeOffset];
	}

	function normalizeRange(range, rootNode) {
		function normalize(range, start) {
			var targetOffset, sibling, node, container, offset;

			container = range.startContainer;
			offset = range.startOffset;

			if (!NodeType.isText(container)) {
				return range;
			}

			targetOffset = start ? 0 : container.data.length;

			if (!isCaretContainer(container)) {
				if (start && offset <= 1 && CaretContainer.startsWithCaretContainer(container)) {
					offset = 0;
				}

				if (!start && offset >= container.data.length - 1 && CaretContainer.endsWithCaretContainer(container)) {
					offset = container.data.length;
				}
			}

			if (offset == targetOffset) {
				for (node = container; node && node != rootNode; node = node.parentNode) {
					sibling = node[start ? 'previousSibling' : 'nextSibling'];

					if (isContentEditableFalse(sibling)) {
						if (isBlockLike(sibling)) {
							break;
						}

						if (start) {
							range.setStartAfter(sibling);
							range.setEndAfter(sibling);
						} else {
							range.setStartBefore(sibling);
							range.setEndBefore(sibling);
						}

						break;
					}

					if (CaretCandidate.isCaretCandidate(sibling)) {
						break;
					}

					if (CaretContainer.isCaretContainer(sibling)) {
						range.setStart(sibling, 0);
						range.setEnd(sibling, 0);
						break;
					}
				}
			}

			return range;
		}

		if (range.collapsed) {
			range = normalize(range, true);
			range = normalize(range, false);
		}

		return range;
	}

	function isNextToContentEditableFalse(relativeOffset, caretPosition) {
		return isContentEditableFalse(getChildNodeAtRelativeOffset(relativeOffset, caretPosition));
	}

	return {
		isForwards: isForwards,
		isBackwards: isBackwards,
		findNode: findNode,
		getEditingHost: getEditingHost,
		getParentBlock: getParentBlock,
		isInSameBlock: isInSameBlock,
		isInSameEditingHost: isInSameEditingHost,
		getOuterCaretPosition: getOuterCaretPosition,
		isBeforeContentEditableFalse: curry(isNextToContentEditableFalse, 0),
		isAfterContentEditableFalse: curry(isNextToContentEditableFalse, -1),
		normalizeRange: normalizeRange
	};
});