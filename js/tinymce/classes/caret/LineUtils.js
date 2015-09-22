/**
 * LineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with lines.
 *
 * @private
 * @class tinymce.caret.LineUtils
 */
define("tinymce/caret/LineUtils", [
	"tinymce/util/Fun",
	"tinymce/util/Arr",
	"tinymce/dom/NodeType",
	"tinymce/dom/Dimensions",
	"tinymce/geom/ClientRect",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/CaretCandidate",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition"
], function(Fun, Arr, NodeType, Dimensions, ClientRect, CaretUtils, CaretCandidate, CaretWalker, CaretPosition) {
	var isContentEditableFalse = NodeType.isContentEditableFalse,
		findNode = CaretUtils.findNode,
		curry = Fun.curry;

	function distanceToRectLeft(clientRect, clientX) {
		return Math.abs(clientRect.left - clientX);
	}

	function distanceToRectRight(clientRect, clientX) {
		return Math.abs(clientRect.right - clientX);
	}

	function findClosestClientRect(clientRects, clientX) {
		return Arr.reduce(clientRects, function(result, clientRect) {
			var oldClientRect = result,
				oldDistance, newDistance;

			oldDistance = Math.min(distanceToRectLeft(oldClientRect, clientX), distanceToRectRight(oldClientRect, clientX));
			newDistance = Math.min(distanceToRectLeft(clientRect, clientX), distanceToRectRight(clientRect, clientX));

			// cE=false has higher priority
			if (newDistance == oldDistance && isContentEditableFalse(clientRect.node)) {
				return clientRect;
			}

			if (newDistance < oldDistance) {
				return clientRect;
			}

			return result;
		});
	}

	function walkUntil(direction, rootNode, predicateFn, node) {
		while ((node = findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
			if (predicateFn(node)) {
				return;
			}
		}
	}

	function findLineNodeRects(rootNode, targetNodeRect) {
		var clientRects = [];

		function collect(checkPosFn, node) {
			var lineRects;

			lineRects = Arr.filter(Dimensions.getClientRects(node), function(clientRect) {
				return !checkPosFn(clientRect, targetNodeRect);
			});

			clientRects = clientRects.concat(lineRects);

			return lineRects.length === 0;
		}

		clientRects.push(targetNodeRect);
		walkUntil(-1, rootNode, curry(collect, ClientRect.isAbove), targetNodeRect.node);
		walkUntil(1, rootNode, curry(collect, ClientRect.isBelow), targetNodeRect.node);

		return clientRects;
	}

	function getContentEditableFalseChildren(rootNode) {
		return Arr.filter(Arr.toArray(rootNode.getElementsByTagName('*')), isContentEditableFalse);
	}

	function caretInfo(clientRect, clientX) {
		return {
			node: clientRect.node,
			before: distanceToRectLeft(clientRect, clientX) < distanceToRectRight(clientRect, clientX)
		};
	}

	function closestCaret(rootNode, clientX, clientY) {
		var contentEditableFalseNodeRects, closestNodeRect;

		contentEditableFalseNodeRects = Dimensions.getClientRects(getContentEditableFalseChildren(rootNode));
		contentEditableFalseNodeRects = Arr.filter(contentEditableFalseNodeRects, function(clientRect) {
			return clientY >= clientRect.top && clientY <= clientRect.bottom;
		});

		closestNodeRect = findClosestClientRect(contentEditableFalseNodeRects, clientX);
		if (closestNodeRect) {
			closestNodeRect = findClosestClientRect(findLineNodeRects(rootNode, closestNodeRect), clientX);
			if (closestNodeRect && isContentEditableFalse(closestNodeRect.node)) {
				return caretInfo(closestNodeRect, clientX);
			}
		}

		return null;
	}

	function findClosestCaretPosition(direction, node, clientX) {
		var caretWalker, caretPosition, bestCaretPosition, walkFn, isBelowFn,
			oldClientRect, clientRect, newDistance, oldDistance = null;

		if (NodeType.isElement(node)) {
			return null;
		}

		caretWalker = new CaretWalker(node.parentNode);

		if (direction == 1) {
			walkFn = caretWalker.next;
			isBelowFn = ClientRect.isBelow;
			caretPosition = new CaretPosition(node, 0);
		} else {
			walkFn = caretWalker.prev;
			isBelowFn = ClientRect.isAbove;
			caretPosition = new CaretPosition(node, node.data.length);
		}

		do {
			if (caretPosition.container() != node) {
				return null;
			}

			if (!caretPosition.isVisible()) {
				continue;
			}

			if (direction == 1) {
				clientRect = caretPosition.getClientRects()[0];
			} else {
				clientRect = Arr.last(caretPosition.getClientRects());
			}

			if (oldClientRect && isBelowFn(clientRect, oldClientRect)) {
				break;
			}

			oldClientRect = clientRect;
			newDistance = Math.abs(clientRect.left - clientX);

			if (oldDistance !== null && newDistance > oldDistance) {
				break;
			}

			bestCaretPosition = caretPosition;
			oldDistance = newDistance;
		} while ((caretPosition = walkFn(caretPosition)));

		return bestCaretPosition;
	}

	return {
		findClosestClientRect: findClosestClientRect,
		findLineNodeRects: findLineNodeRects,
		closestCaret: closestCaret,
		findClosestCaretPosition: findClosestCaretPosition
	};
});