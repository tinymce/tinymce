/**
 * SelectionOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic overriding the selection with keyboard/mouse
 * around contentEditable=false regions.
 *
 * @example
 * // Disable the default cE=false selection
 * tinymce.activeEditor.on('ShowCaret ObjectSelected', function(e) {
 *     e.preventDefault();
 * });
 *
 * @private
 * @class tinymce.SelectionOverrides
 */
define("tinymce/SelectionOverrides", [
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretContainer",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/FakeCaret",
	"tinymce/caret/LineWalker",
	"tinymce/dom/NodeType",
	"tinymce/dom/RangeUtils",
	"tinymce/util/VK",
	"tinymce/util/Fun",
	"tinymce/util/Arr",
	"tinymce/util/Delay"
], function(CaretWalker, CaretPosition, CaretContainer, CaretUtils, FakeCaret, LineWalker, NodeType, RangeUtils, VK, Fun, Arr, Delay) {
	var curry = Fun.curry,
		isContentEditableTrue = NodeType.isContentEditableTrue,
		isContentEditableFalse = NodeType.isContentEditableFalse,
		isElement = NodeType.isElement,
		isAfterContentEditableFalse = CaretUtils.isAfterContentEditableFalse,
		isBeforeContentEditableFalse = CaretUtils.isBeforeContentEditableFalse,
		getSelectedNode = RangeUtils.getSelectedNode;

	function getVisualCaretPosition(walkFn, caretPosition) {
		while ((caretPosition = walkFn(caretPosition))) {
			if (caretPosition.isVisible()) {
				return caretPosition;
			}
		}

		return caretPosition;
	}

	function SelectionOverrides(editor) {
		var rootNode = editor.getBody(), caretWalker = new CaretWalker(rootNode);
		var getNextVisualCaretPosition = curry(getVisualCaretPosition, caretWalker.next);
		var getPrevVisualCaretPosition = curry(getVisualCaretPosition, caretWalker.prev),
			fakeCaret = new FakeCaret(editor.getBody()),
			realSelectionId = editor.dom.uniqueId(),
			selectedContentEditableNode;

		function showCaret(direction, node, before) {
			var e;

			e = editor.fire('ShowCaret', {
				target: node,
				direction: direction,
				before: before
			});

			if (e.isDefaultPrevented()) {
				return null;
			}

			return fakeCaret.show(direction, node, before);
		}

		function selectNode(node) {
			var e;

			e = editor.fire('ObjectSelected', {target: node});
			if (e.isDefaultPrevented()) {
				return null;
			}

			fakeCaret.hide();
			return getNodeRange(node);
		}

		function getNodeRange(node) {
			var rng = node.ownerDocument.createRange();

			rng.selectNode(node);

			return rng;
		}

		function isCaretPositionCaretContainerBlock(caretPosition) {
			return CaretContainer.isCaretContainerBlock(caretPosition.getNode());
		}

		function isMoveInsideSameBlock(fromCaretPosition, toCaretPosition) {
			var inSameBlock = CaretUtils.isInSameBlock(fromCaretPosition, toCaretPosition);

			// Handle bogus BR <p>abc|<br></p>
			if (!inSameBlock && NodeType.isBr(fromCaretPosition.getNode())) {
				return true;
			}

			return inSameBlock;
		}

		function getRangeEndPoint(direction, range) {
			if (direction == -1) {
				return CaretPosition.fromRangeStart(range);
			}

			return CaretPosition.fromRangeEnd(range);
		}

		function moveH(direction, getNextPosFn, isBeforeContentEditableFalseFn, range) {
			var node, pendingRange, startCaretPosition, caretPosition, peekCaretPosition, inCaretBlockPos;

			if ((pendingRange = fakeCaret.showPendingCaret(direction, range))) {
				return pendingRange;
			}

			if (!range.collapsed) {
				node = getSelectedNode(range);
				if (isContentEditableFalse(node)) {
					return showCaret(direction, node, direction == -1);
				}
			}

			range = CaretUtils.normalizeRange(range);
			startCaretPosition = caretPosition = getRangeEndPoint(direction, range);
			inCaretBlockPos = isCaretPositionCaretContainerBlock(startCaretPosition);
			caretPosition = CaretUtils.getOuterCaretPosition(direction, caretPosition);

			if (isBeforeContentEditableFalseFn(caretPosition)) {
				return selectNode(caretPosition.getNode(direction == -1));
			}

			caretPosition = getNextPosFn(caretPosition);
			if (!caretPosition) {
				if (inCaretBlockPos) {
					return range;
				}

				return null;
			}

			if (isBeforeContentEditableFalseFn(caretPosition)) {
				if (CaretUtils.isInSameBlock(startCaretPosition, caretPosition)) {
					return selectNode(caretPosition.getNode(direction == -1));
				}

				return showCaret(direction, caretPosition.getNode(direction == -1), direction == 1);
			}

			// Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
			peekCaretPosition = getNextPosFn(caretPosition);
			if (isBeforeContentEditableFalseFn(peekCaretPosition)) {
				if (isMoveInsideSameBlock(caretPosition, peekCaretPosition)) {
					return showCaret(direction, peekCaretPosition.getNode(direction == -1), direction == 1);
				}
			}

			if (inCaretBlockPos) {
				fakeCaret.hide();
				return caretPosition.toRange();
			}

			return null;
		}

		function moveV(direction, walkerFn, range) {
			var caretPosition, linePositions, nextLinePositions,
				closestNextLinePosition, caretClientRect, closestRect, clientX,
				dist1, dist2;

			caretPosition = CaretUtils.getOuterCaretPosition(direction, getRangeEndPoint(direction, range));
			linePositions = walkerFn(rootNode, LineWalker.isAboveLine(1), caretPosition);
			nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));

			if (direction == 1) {
				caretClientRect = Arr.last(caretPosition.getClientRects());
			} else {
				caretClientRect = caretPosition.getClientRects()[0];
			}

			caretClientRect = fakeCaret.getClientRect() || caretClientRect;
			if (!caretClientRect) {
				return null;
			}

			clientX = caretClientRect.left;

			closestNextLinePosition = LineWalker.findClosest(nextLinePositions, clientX);
			if (closestNextLinePosition && isContentEditableFalse(closestNextLinePosition.node)) {
				closestRect = closestNextLinePosition.clientRect;
				dist1 = Math.abs(clientX - closestRect.left);
				dist2 = Math.abs(clientX - closestRect.right);

				return showCaret(1, closestNextLinePosition.node, dist1 < dist2);
			}
		}

		function showBlockCaretContainers() {
			editor.$('*[data-mce-caret]').each(function(i, elm) {
				if (elm.innerHTML != '&nbsp;') {
					elm.removeAttribute('data-mce-caret');
					elm.removeAttribute('data-mce-bogus');
					elm.removeAttribute('style');
					fakeCaret.hide();

					// Removes control rect on IE
					editor.selection.setRng(editor.selection.getRng());
				}
			});
		}

		function renderRangeCaret(range) {
			var caretPosition;

			if (!range) {
				return range;
			}

			if (!range.collapsed) {
				return range;
			}

			range = CaretUtils.normalizeRange(range);
			caretPosition = CaretPosition.fromRangeStart(range);

			if (isContentEditableFalse(caretPosition.getNode())) {
				return showCaret(1, caretPosition.getNode(), !caretPosition.isAtEnd());
			}

			if (isContentEditableFalse(caretPosition.getNode(true))) {
				return showCaret(1, caretPosition.getNode(true), false);
			}

			return range;
		}

		function deleteContentEditableNode(node) {
			var nextCaretPosition, prevCaretPosition, prevCeFalseElm, nextElement;

			if (!isContentEditableFalse(node)) {
				return null;
			}

			if (isContentEditableFalse(node.previousSibling)) {
				prevCeFalseElm = node.previousSibling;
			}

			prevCaretPosition = getPrevVisualCaretPosition(CaretPosition.before(node));
			if (!prevCaretPosition) {
				nextCaretPosition = getNextVisualCaretPosition(CaretPosition.after(node));
			}

			if (nextCaretPosition && isElement(nextCaretPosition.getNode())) {
				nextElement = nextCaretPosition.getNode();
			}

			CaretContainer.remove(node.previousSibling);
			CaretContainer.remove(node.nextSibling);
			editor.dom.remove(node);
			clearContentEditableSelection();

			if (editor.dom.isEmpty(editor.getBody())) {
				editor.setContent('');
				editor.focus();
				return;
			}

			if (prevCeFalseElm) {
				return CaretPosition.after(prevCeFalseElm).toRange();
			}

			if (nextElement) {
				return CaretPosition.before(nextElement).toRange();
			}

			if (prevCaretPosition) {
				return prevCaretPosition.toRange();
			}

			if (nextCaretPosition) {
				return nextCaretPosition.toRange();
			}

			return null;
		}

		function backspaceDelete(direction, beforeFn, range) {
			var node, caretPosition;

			if (!range.collapsed) {
				node = getSelectedNode(range);
				if (isContentEditableFalse(node)) {
					return renderRangeCaret(deleteContentEditableNode(node));
				}
			}

			range = CaretUtils.normalizeRange(range);
			caretPosition = CaretPosition.fromRangeEnd(range);
			caretPosition = CaretUtils.getOuterCaretPosition(direction, caretPosition);

			if (beforeFn(caretPosition)) {
				return renderRangeCaret(deleteContentEditableNode(caretPosition.getNode(direction == -1)));
			}
		}

		function registerEvents() {
			var right = curry(moveH, 1, getNextVisualCaretPosition, isBeforeContentEditableFalse);
			var left = curry(moveH, -1, getPrevVisualCaretPosition, isAfterContentEditableFalse);
			var deleteForward = curry(backspaceDelete, 1, isBeforeContentEditableFalse);
			var backspace = curry(backspaceDelete, -1, isAfterContentEditableFalse);
			var up = curry(moveV, -1, LineWalker.upUntil);
			var down = curry(moveV, 1, LineWalker.downUntil);

			function override(moveFn) {
				var range = moveFn(editor.selection.getRng());

				if (range) {
					editor.selection.setRng(range);
					return true;
				}

				return false;
			}

			function getContentEditableRoot(node) {
				var root = editor.getBody();

				while (node && node != root) {
					if (isContentEditableTrue(node) || isContentEditableFalse(node)) {
						return node;
					}

					node = node.parentNode;
				}

				return null;
			}

			editor.on('mousedown', function(e) {
				var contentEditableRoot = getContentEditableRoot(e.target);

				if (contentEditableRoot) {
					if (isContentEditableFalse(contentEditableRoot)) {
						e.preventDefault();
						setContentEditableSelection(selectNode(contentEditableRoot), false);
					} else {
						editor.selection.placeCaretAt(e.clientX, e.clientY);
					}
				} else {
					clearContentEditableSelection();
				}
			});

			editor.on('keydown', function(e) {
				var prevent;

				if (VK.modifierPressed(e)) {
					return;
				}

				switch (e.keyCode) {
					case VK.RIGHT:
						prevent = override(right);
						break;

					case VK.DOWN:
						prevent = override(down);
						break;

					case VK.LEFT:
						prevent = override(left);
						break;

					case VK.UP:
						prevent = override(up);
						break;

					case VK.DELETE:
						prevent = override(deleteForward);
						break;

					case VK.BACKSPACE:
						prevent = override(backspace);
						break;

					default:
						prevent = isContentEditableFalse(editor.selection.getNode());
						break;
				}

				if (prevent) {
					e.preventDefault();
				}
			});

			// Must be added to "top" since undoManager needs to be executed after
			editor.on('keyup compositionstart', function() {
				showBlockCaretContainers();
			}, true);

			editor.on('cut', function() {
				var node = editor.selection.getNode();

				if (isContentEditableFalse(node)) {
					Delay.setEditorTimeout(editor, function() {
						editor.selection.setRng(renderRangeCaret(deleteContentEditableNode(node)));
					});
				}
			});

			editor.on('getSelectionRange', function(e) {
				var rng = e.range;

				if (selectedContentEditableNode) {
					rng = rng.cloneRange();
					rng.selectNode(selectedContentEditableNode);
					e.range = rng;
				}
			});

			editor.on('setSelectionRange', function(e) {
				var rng;

				rng = setContentEditableSelection(e.range);
				if (rng) {
					e.range = rng;
				}
			});
		}

		function addCss() {
			var styles = editor.contentStyles, rootClass = '.mce-content-body';

			styles.push(fakeCaret.getCss());
			styles.push(
				rootClass + ' .mce-offscreen-selection {' +
					'position: absolute;' +
					'left: -5000px;' +
					'width: 100px' +
					'height: 100px' +
				'}' +
				rootClass + ' *[contentEditable=false] {' +
					'cursor: default;' +
				'}' +
				rootClass + ' *[contentEditable=true] {' +
					'cursor: text;' +
				'}'
			);
		}

		function setContentEditableSelection(range, fireEvent) {
			var node, $ = editor.$, dom = editor.dom, $realSelectionContainer, sel,
				startContainer, startOffset, endOffset, e;

			if (!range || range.collapsed) {
				clearContentEditableSelection();
				return null;
			}

			startContainer = range.startContainer;
			startOffset = range.startOffset;
			endOffset = range.endOffset;

			// Normalizes <span cE=false>[</span>] to [<span cE=false></span>]
			if (startContainer.nodeType == 3 && startOffset == 0 && isContentEditableFalse(startContainer.parentNode)) {
				startContainer = startContainer.parentNode;
				startOffset = dom.nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			if (startContainer.nodeType != 1) {
				clearContentEditableSelection();
				return null;
			}

			if (endOffset == startOffset + 1) {
				node = startContainer.childNodes[startOffset];
			}

			if (isContentEditableFalse(node)) {
				if (fireEvent !== false) {
					e = editor.fire('ObjectSelected', {target: node});
					if (e.isDefaultPrevented()) {
						clearContentEditableSelection();
						return null;
					}
				}

				$realSelectionContainer = $('#' + realSelectionId);
				if ($realSelectionContainer.length === 0) {
					$realSelectionContainer = $(
						'<div data-mce-bogus="all" class="mce-offscreen-selection"></div>'
					).attr('id', realSelectionId).css({
						top: dom.getPos(node).y
					});

					$realSelectionContainer.appendTo(editor.getBody());
				}

				$realSelectionContainer.empty().append('\u00a0').append(node.cloneNode(true)).append('\u00a0');

				range = editor.dom.createRng();
				range.setStart($realSelectionContainer[0].firstChild, 1);
				range.setEnd($realSelectionContainer[0].lastChild, 0);

				editor.getBody().focus();
				$realSelectionContainer[0].focus();
				sel = editor.selection.getSel();
				sel.removeAllRanges();
				sel.addRange(range);

				editor.$('*[data-mce-selected]').removeAttr('data-mce-selected');
				node.setAttribute('data-mce-selected', 1);
				selectedContentEditableNode = node;

				return range;
			}

			clearContentEditableSelection();
			return null;
		}

		function clearContentEditableSelection() {
			if (selectedContentEditableNode) {
				selectedContentEditableNode.removeAttribute('data-mce-selected');
				editor.$('#' + realSelectionId).remove();
				selectedContentEditableNode = null;
			}
		}

		function destroy() {
			fakeCaret.destroy();
			selectedContentEditableNode = null;
		}

		registerEvents();
		addCss();

		return {
			destroy: destroy
		};
	}

	return SelectionOverrides;
});
