/**
 * LineWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module lets you walk the document line by line
 * returing nodes and client rects for each line.
 *
 * @private
 * @class tinymce.caret.LineWalker
 */
define("tinymce/caret/LineWalker", [
	"tinymce/util/Fun",
	"tinymce/util/Arr",
	"tinymce/dom/NodeType",
	"tinymce/caret/CaretCandidate",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/geom/ClientRect"
], function(Fun, Arr, NodeType, CaretCandidate, CaretUtils, CaretWalker, CaretPosition, ClientRect) {
	var curry = Fun.curry,
		isContentEditableFalse = NodeType.isContentEditableFalse,
		isElement = NodeType.isElement,
		isText = NodeType.isText;

	function findUntil(direction, rootNode, predicateFn, node) {
		while ((node = CaretUtils.findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
			if (predicateFn(node)) {
				return;
			}
		}
	}

	function getNodeClientRects(node) {
		if (isElement(node)) {
			return Arr.toArray(node.getClientRects());
		}

		if (isText(node)) {
			var rng = node.ownerDocument.createRange();

			rng.setStart(node, 0);
			rng.setEnd(node, node.data.length);

			return Arr.toArray(rng.getClientRects());
		}
	}

	function walkUntil(direction, isAboveFn, isBeflowFn, rootNode, predicateFn, caretPosition) {
		var line = 0, node, result = [], clientRect;

		function add(node) {
			var i, item, clientRects;

			clientRects = getNodeClientRects(node);
			if (direction == -1) {
				clientRects = clientRects.reverse();
			}

			for (i = 0; i < clientRects.length; i++) {
				if (isBeflowFn(clientRects[i], clientRect)) {
					continue;
				}

				if (result.length > 0 && isAboveFn(clientRects[i], Arr.last(result).clientRect)) {
					line++;
				}

				item = {
					node: node,
					clientRect: clientRects[i],
					line: line
				};

				if (predicateFn(item)) {
					return true;
				}

				result.push(item);
			}
		}

		if (direction == 1) {
			clientRect = Arr.last(caretPosition.getClientRects());
		} else {
			clientRect = caretPosition.getClientRects()[0];
		}

		if (!clientRect) {
			return result;
		}

		node = caretPosition.getNode(direction == -1);
		add(node);
		findUntil(direction, rootNode, add, node);

		return result;
	}

	function findClosest(linePositions, clientX) {
		var i, clientRect;

		for (i = 0; i < linePositions.length; i++) {
			clientRect = linePositions[i].clientRect;

			if (clientX >= clientRect.left && clientX <= clientRect.right) {
				return linePositions[i];
			}
		}

		return Arr.reduce(linePositions, function(result, linePosition) {
			var oldClientRect = result.clientRect,
				clientRect = linePosition.clientRect,
				oldDistance, newDistance;

			oldDistance = Math.min(Math.abs(oldClientRect.left - clientX), Math.abs(oldClientRect.right - clientX));
			newDistance = Math.min(Math.abs(clientRect.left - clientX), Math.abs(oldClientRect.right - clientX));

			// cE=false has higher priority
			if (newDistance == oldDistance && isContentEditableFalse(linePosition.node)) {
				return linePosition;
			}

			if (newDistance < oldDistance) {
				return linePosition;
			}

			return result;
		});
	}

	function findClosestCaretPosition(direction, node, clientX) {
		var caretWalker, caretPosition, bestCaretPosition, walkFn, isBelowFn,
			oldClientRect, clientRect, newDistance, oldDistance = null;

		if (isElement(node)) {
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

	function aboveLineNumber(lineNumber, item) {
		return item.line > lineNumber;
	}

	function isLine(lineNumber, item) {
		return item.line === lineNumber;
	}

	var upUntil = curry(walkUntil, -1, ClientRect.isAbove, ClientRect.isBelow);
	var downUntil = curry(walkUntil, 1, ClientRect.isBelow, ClientRect.isAbove);

	return {
		upUntil: upUntil,
		downUntil: downUntil,
		isAboveLine: curry(aboveLineNumber),
		isLine: curry(isLine),
		findClosest: findClosest,
		findClosestCaretPosition: findClosestCaretPosition
	};
});