/**
 * CaretWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for moving around a virtual caret in logical order within a DOM element.
 *
 * It ignores the most obvious invalid caret locations such as within a script element or within a
 * contentEditable=false element but it will return locations that isn't possible to render visually.
 *
 * @private
 * @class tinymce.caret.CaretWalker
 * @example
 * var caretWalker = new CaretWalker(rootElm);
 *
 * var prevLogicalCaretPosition = caretWalker.prev(CaretPosition.fromRangeStart(range));
 * var nextLogicalCaretPosition = caretWalker.next(CaretPosition.fromRangeEnd(range));
 */
define("tinymce/caret/CaretWalker", [
	"tinymce/dom/NodeType",
	"tinymce/caret/CaretCandidate",
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretUtils",
	"tinymce/util/Arr",
	"tinymce/util/Fun"
], function(NodeType, CaretCandidate, CaretPosition, CaretUtils, Arr, Fun) {
	var isContentEditableFalse = NodeType.isContentEditableFalse,
		isText = NodeType.isText,
		isElement = NodeType.isElement,
		isForwards = CaretUtils.isForwards,
		isBackwards = CaretUtils.isBackwards,
		isCaretCandidate = CaretCandidate.isCaretCandidate,
		isAtomic = CaretCandidate.isAtomic,
		isEditableCaretCandidate = CaretCandidate.isEditableCaretCandidate;

	function getParents(node, rootNode) {
		var parents = [];

		while (node && node != rootNode) {
			parents.push(node);
			node = node.parentNode;
		}

		return parents;
	}

	function nodeAtIndex(container, offset) {
		if (container.hasChildNodes() && offset < container.childNodes.length) {
			return container.childNodes[offset];
		}

		return null;
	}

	function getCaretCandidatePosition(direction, node) {
		if (isForwards(direction)) {
			if (isCaretCandidate(node.previousSibling) && !isText(node.previousSibling)) {
				return CaretPosition.before(node);
			}

			if (isText(node)) {
				return CaretPosition(node, 0);
			}
		}

		if (isBackwards(direction)) {
			if (isCaretCandidate(node.nextSibling) && !isText(node.nextSibling)) {
				return CaretPosition.after(node);
			}

			if (isText(node)) {
				return CaretPosition(node, node.data.length);
			}
		}

		if (isBackwards(direction)) {
			return CaretPosition.after(node);
		}

		return CaretPosition.before(node);
	}

	function findCaretPosition(direction, startCaretPosition, rootNode) {
		var container, offset, node, nextNode, innerNode,
			rootContentEditableFalseElm, caretPosition;

		if (!isElement(rootNode) || !startCaretPosition) {
			return null;
		}

		caretPosition = startCaretPosition;
		container = caretPosition.container();
		offset = caretPosition.offset();

		if (isText(container)) {
			if (isBackwards(direction) && offset > 0) {
				return CaretPosition(container, --offset);
			}

			if (isForwards(direction) && offset < container.length) {
				return CaretPosition(container, ++offset);
			}

			node = container;
		} else {
			if (isBackwards(direction) && offset > 0) {
				nextNode = nodeAtIndex(container, offset - 1);
				if (isCaretCandidate(nextNode)) {
					if (!isAtomic(nextNode)) {
						innerNode = CaretUtils.findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
						if (innerNode) {
							if (isText(innerNode)) {
								return CaretPosition(innerNode, innerNode.data.length);
							}

							return CaretPosition.after(innerNode);
						}
					}

					if (isText(nextNode)) {
						return CaretPosition(nextNode, nextNode.data.length);
					}

					return CaretPosition.before(nextNode);
				}
			}

			if (isForwards(direction) && offset < container.childNodes.length) {
				nextNode = nodeAtIndex(container, offset);
				if (isCaretCandidate(nextNode)) {
					if (!isAtomic(nextNode)) {
						innerNode = CaretUtils.findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
						if (innerNode) {
							if (isText(innerNode)) {
								return CaretPosition(innerNode, 0);
							}

							return CaretPosition.before(innerNode);
						}
					}

					if (isText(nextNode)) {
						return CaretPosition(nextNode, 0);
					}

					return CaretPosition.after(nextNode);
				}
			}

			node = caretPosition.getNode();
		}

		if ((isForwards(direction) && caretPosition.isAtEnd()) || (isBackwards(direction) && caretPosition.isAtStart())) {
			node = CaretUtils.findNode(node, direction, Fun.constant(true), rootNode, true);
			if (isEditableCaretCandidate(node)) {
				return getCaretCandidatePosition(direction, node);
			}
		}

		nextNode = CaretUtils.findNode(node, direction, isEditableCaretCandidate, rootNode);

		rootContentEditableFalseElm = Arr.last(Arr.filter(getParents(container, rootNode), isContentEditableFalse));
		if (rootContentEditableFalseElm && (!nextNode || !rootContentEditableFalseElm.contains(nextNode))) {
			if (isForwards(direction)) {
				caretPosition = CaretPosition.after(rootContentEditableFalseElm);
			} else {
				caretPosition = CaretPosition.before(rootContentEditableFalseElm);
			}

			return caretPosition;
		}

		if (nextNode) {
			return getCaretCandidatePosition(direction, nextNode);
		}

		return null;
	}

	return function(rootNode) {
		return {
			/**
			 * Returns the next logical caret position from the specificed input
			 * caretPoisiton or null if there isn't any more positions left for example
			 * at the end specified root element.
			 *
			 * @method next
			 * @param {tinymce.caret.CaretPosition} caretPosition Caret position to start from.
			 * @return {tinymce.caret.CaretPosition} CaretPosition or null if no position was found.
			 */
			next: function(caretPosition) {
				return findCaretPosition(1, caretPosition, rootNode);
			},

			/**
			 * Returns the previous logical caret position from the specificed input
			 * caretPoisiton or null if there isn't any more positions left for example
			 * at the end specified root element.
			 *
			 * @method prev
			 * @param {tinymce.caret.CaretPosition} caretPosition Caret position to start from.
			 * @return {tinymce.caret.CaretPosition} CaretPosition or null if no position was found.
			 */
			prev: function(caretPosition) {
				return findCaretPosition(-1, caretPosition, rootNode);
			}
		};
	};
});