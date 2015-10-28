/**
 * CaretPosition.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for creating caret positions within a document a caretposition
 * is similar to a DOMRange object but it doesn't have two endpoints and is also more lightweight
 * since it's now updated live when the DOM changes.
 *
 * @private
 * @class tinymce.caret.CaretPosition
 * @example
 * var caretPos1 = new CaretPosition(container, offset);
 * var caretPos2 = CaretPosition.fromRangeStart(someRange);
 */
define("tinymce/caret/CaretPosition", [
	"tinymce/util/Fun",
	"tinymce/dom/NodeType",
	"tinymce/dom/DOMUtils",
	"tinymce/dom/RangeUtils",
	"tinymce/caret/CaretCandidate",
	"tinymce/geom/ClientRect",
	"tinymce/text/ExtendingChar"
], function(Fun, NodeType, DOMUtils, RangeUtils, CaretCandidate, ClientRect, ExtendingChar) {
	var isElement = NodeType.isElement,
		isCaretCandidate = CaretCandidate.isCaretCandidate,
		isBlock = NodeType.matchStyleValues('display', 'block table'),
		isFloated = NodeType.matchStyleValues('float', 'left right'),
		isValidElementCaretCandidate = Fun.and(isElement, isCaretCandidate, Fun.negate(isFloated)),
		isNotPre = Fun.negate(NodeType.matchStyleValues('white-space', 'pre pre-line pre-wrap')),
		isText = NodeType.isText,
		isBr = NodeType.isBr,
		nodeIndex = DOMUtils.nodeIndex,
		resolveIndex = RangeUtils.getNode;

	function isWhiteSpace(chr) {
		return chr && /[\r\n\t ]/.test(chr);
	}

	function isHiddenWhiteSpaceRange(range) {
		var container = range.startContainer,
			offset = range.startOffset,
			text;

		if (isWhiteSpace(range.toString()) && isNotPre(container.parentNode)) {
			text = container.data;

			if (isWhiteSpace(text[offset - 1]) || isWhiteSpace(text[offset + 1])) {
				return true;
			}
		}

		return false;
	}

	function getCaretPositionClientRects(caretPosition) {
		var clientRects = [], beforeNode, node;

		// Hack for older WebKit versions that doesn't
		// support getBoundingClientRect on BR elements
		function getBrClientRect(brNode) {
			var doc = brNode.ownerDocument,
				rng = doc.createRange(),
				nbsp = doc.createTextNode('\u00a0'),
				parentNode = brNode.parentNode,
				clientRect;

			parentNode.insertBefore(nbsp, brNode);
			rng.setStart(nbsp, 0);
			rng.setEnd(nbsp, 1);
			clientRect = ClientRect.clone(rng.getBoundingClientRect());
			parentNode.removeChild(nbsp);

			return clientRect;
		}

		function getBoundingClientRect(item) {
			var clientRect, clientRects;

			clientRects = item.getClientRects();
			if (clientRects.length > 0) {
				clientRect = ClientRect.clone(clientRects[0]);
			} else {
				clientRect = ClientRect.clone(item.getBoundingClientRect());
			}

			if (isBr(item) && clientRect.left === 0) {
				return getBrClientRect(item);
			}

			return clientRect;
		}

		function collapseAndInflateWidth(clientRect, toStart) {
			clientRect = ClientRect.collapse(clientRect, toStart);
			clientRect.width = 1;
			clientRect.right = clientRect.left + 1;

			return clientRect;
		}

		function addUniqueAndValidRect(clientRect) {
			if (clientRect.height === 0) {
				return;
			}

			if (clientRects.length > 0) {
				if (ClientRect.isEqual(clientRect, clientRects[clientRects.length - 1])) {
					return;
				}
			}

			clientRects.push(clientRect);
		}

		function addCharacterOffset(container, offset) {
			var range = container.ownerDocument.createRange();

			if (offset < container.data.length) {
				if (ExtendingChar.isExtendingChar(container.data[offset])) {
					return clientRects;
				}
			}

			if (offset > 0) {
				range.setStart(container, offset - 1);
				range.setEnd(container, offset);

				if (!isHiddenWhiteSpaceRange(range)) {
					addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), false));
				}
			}

			if (offset < container.data.length) {
				range.setStart(container, offset);
				range.setEnd(container, offset + 1);

				if (!isHiddenWhiteSpaceRange(range)) {
					addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(range), true));
				}
			}
		}

		if (isText(caretPosition.container())) {
			addCharacterOffset(caretPosition.container(), caretPosition.offset());
			return clientRects;
		}

		if (isElement(caretPosition.container())) {
			if (caretPosition.isAtEnd()) {
				node = resolveIndex(caretPosition.container(), caretPosition.offset());
				if (isText(node)) {
					addCharacterOffset(node, node.data.length);
				}

				if (isValidElementCaretCandidate(node) && !isBr(node)) {
					addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
				}
			} else {
				node = resolveIndex(caretPosition.container(), caretPosition.offset());
				if (isText(node)) {
					addCharacterOffset(node, 0);
				}

				if (isValidElementCaretCandidate(node) && caretPosition.isAtEnd()) {
					addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
					return clientRects;
				}

				beforeNode = resolveIndex(caretPosition.container(), caretPosition.offset() - 1);
				if (isValidElementCaretCandidate(beforeNode) && !isBr(beforeNode)) {
					if (isBlock(beforeNode) || isBlock(node) || !isValidElementCaretCandidate(node)) {
						addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(beforeNode), false));
					}
				}

				if (isValidElementCaretCandidate(node)) {
					addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), true));
				}
			}
		}

		return clientRects;
	}

	function CaretPosition(container, offset, clientRects) {
		function isAtStart() {
			if (isText(container)) {
				return offset === 0;
			}

			return offset === 0;
		}

		function isAtEnd() {
			if (isText(container)) {
				return offset >= container.data.length;
			}

			return offset >= container.childNodes.length;
		}

		function toRange() {
			var range;

			range = container.ownerDocument.createRange();
			range.setStart(container, offset);
			range.setEnd(container, offset);

			return range;
		}

		function getClientRects() {
			if (!clientRects) {
				clientRects = getCaretPositionClientRects(new CaretPosition(container, offset));
			}

			return clientRects;
		}

		function isVisible() {
			return getClientRects().length > 0;
		}

		function isEqual(caretPosition) {
			return caretPosition && container === caretPosition.container() && offset === caretPosition.offset();
		}

		function getNode(before) {
			return resolveIndex(container, before ? offset - 1 : offset);
		}

		return {
			container: Fun.constant(container),
			offset: Fun.constant(offset),
			isAtStart: isAtStart,
			isAtEnd: isAtEnd,
			toRange: toRange,
			getClientRects: getClientRects,
			isVisible: isVisible,
			isEqual: isEqual,
			getNode: getNode
		};
	}

	CaretPosition.fromRangeStart = function(range) {
		return new CaretPosition(range.startContainer, range.startOffset);
	};

	CaretPosition.fromRangeEnd = function(range) {
		return new CaretPosition(range.endContainer, range.endOffset);
	};

	CaretPosition.after = function(node) {
		return new CaretPosition(node.parentNode, nodeIndex(node) + 1);
	};

	CaretPosition.before = function(node) {
		return new CaretPosition(node.parentNode, nodeIndex(node));
	};

	return CaretPosition;
});