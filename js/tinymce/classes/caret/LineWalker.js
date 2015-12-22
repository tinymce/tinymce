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
	"tinymce/dom/Dimensions",
	"tinymce/caret/CaretCandidate",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/geom/ClientRect"
], function(Fun, Arr, Dimensions, CaretCandidate, CaretUtils, CaretWalker, CaretPosition, ClientRect) {
	var curry = Fun.curry;

	function findUntil(direction, rootNode, predicateFn, node) {
		while ((node = CaretUtils.findNode(node, direction, CaretCandidate.isEditableCaretCandidate, rootNode))) {
			if (predicateFn(node)) {
				return;
			}
		}
	}

	function walkUntil(direction, isAboveFn, isBeflowFn, rootNode, predicateFn, caretPosition) {
		var line = 0, node, result = [], targetClientRect;

		function add(node) {
			var i, clientRect, clientRects;

			clientRects = Dimensions.getClientRects(node);
			if (direction == -1) {
				clientRects = clientRects.reverse();
			}

			for (i = 0; i < clientRects.length; i++) {
				clientRect = clientRects[i];
				if (isBeflowFn(clientRect, targetClientRect)) {
					continue;
				}

				if (result.length > 0 && isAboveFn(clientRect, Arr.last(result))) {
					line++;
				}

				clientRect.line = line;

				if (predicateFn(clientRect)) {
					return true;
				}

				result.push(clientRect);
			}
		}

		targetClientRect = Arr.last(caretPosition.getClientRects());
		if (!targetClientRect) {
			return result;
		}

		node = caretPosition.getNode();
		add(node);
		findUntil(direction, rootNode, add, node);

		return result;
	}

	function aboveLineNumber(lineNumber, clientRect) {
		return clientRect.line > lineNumber;
	}

	function isLine(lineNumber, clientRect) {
		return clientRect.line === lineNumber;
	}

	var upUntil = curry(walkUntil, -1, ClientRect.isAbove, ClientRect.isBelow);
	var downUntil = curry(walkUntil, 1, ClientRect.isBelow, ClientRect.isAbove);

	function positionsUntil(direction, rootNode, predicateFn, node) {
		var caretWalker = new CaretWalker(rootNode), walkFn, isBelowFn, isAboveFn,
			caretPosition, result = [], line = 0, clientRect, targetClientRect;

		function getClientRect(caretPosition) {
			if (direction == 1) {
				return Arr.last(caretPosition.getClientRects());
			}

			return Arr.last(caretPosition.getClientRects());
		}

		if (direction == 1) {
			walkFn = caretWalker.next;
			isBelowFn = ClientRect.isBelow;
			isAboveFn = ClientRect.isAbove;
			caretPosition = CaretPosition.after(node);
		} else {
			walkFn = caretWalker.prev;
			isBelowFn = ClientRect.isAbove;
			isAboveFn = ClientRect.isBelow;
			caretPosition = CaretPosition.before(node);
		}

		targetClientRect = getClientRect(caretPosition);

		do {
			if (!caretPosition.isVisible()) {
				continue;
			}

			clientRect = getClientRect(caretPosition);

			if (isAboveFn(clientRect, targetClientRect)) {
				continue;
			}

			if (result.length > 0 && isBelowFn(clientRect, Arr.last(result))) {
				line++;
			}

			clientRect = ClientRect.clone(clientRect);
			clientRect.position = caretPosition;
			clientRect.line = line;

			if (predicateFn(clientRect)) {
				return result;
			}

			result.push(clientRect);
		} while ((caretPosition = walkFn(caretPosition)));

		return result;
	}

	return {
		upUntil: upUntil,
		downUntil: downUntil,

		/**
		 * Find client rects with line and caret position until the predicate returns true.
		 *
		 * @method positionsUntil
		 * @param {Number} direction Direction forward/backward 1/-1.
		 * @param {DOMNode} rootNode Root node to walk within.
		 * @param {function} predicateFn Gets the client rect as it's input.
		 * @param {DOMNode} node Node to start walking from.
		 * @return {Array} Array of client rects with line and position properties.
		 */
		positionsUntil: positionsUntil,

		isAboveLine: curry(aboveLineNumber),
		isLine: curry(isLine)
	};
});