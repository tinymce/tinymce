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
	"tinymce/geom/ClientRect"
], function(Fun, Arr, Dimensions, CaretCandidate, CaretUtils, ClientRect) {
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

		if (direction == 1) {
			targetClientRect = Arr.last(caretPosition.getClientRects());
		} else {
			targetClientRect = caretPosition.getClientRects()[0];
		}

		if (!targetClientRect) {
			return result;
		}

		node = caretPosition.getNode(direction == -1);
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

	return {
		upUntil: upUntil,
		downUntil: downUntil,
		isAboveLine: curry(aboveLineNumber),
		isLine: curry(isLine)
	};
});