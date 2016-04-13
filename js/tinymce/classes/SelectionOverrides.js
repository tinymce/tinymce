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
 * tinymce.activeEditor.on('ShowCaret BeforeObjectSelected', function(e) {
 *     e.preventDefault();
 * });
 *
 * @private
 * @class tinymce.SelectionOverrides
 */
define("tinymce/SelectionOverrides", [
	"tinymce/Env",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/caret/CaretContainer",
	"tinymce/caret/CaretUtils",
	"tinymce/caret/FakeCaret",
	"tinymce/caret/LineWalker",
	"tinymce/caret/LineUtils",
	"tinymce/dom/NodeType",
	"tinymce/dom/RangeUtils",
	"tinymce/geom/ClientRect",
	"tinymce/util/VK",
	"tinymce/util/Fun",
	"tinymce/util/Arr",
	"tinymce/util/Delay",
	"tinymce/DragDropOverrides",
	"tinymce/text/Zwsp"
], function(
	Env, CaretWalker, CaretPosition, CaretContainer, CaretUtils, FakeCaret, LineWalker,
	LineUtils, NodeType, RangeUtils, ClientRect, VK, Fun, Arr, Delay, DragDropOverrides, Zwsp
) {
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
			fakeCaret = new FakeCaret(editor.getBody(), isBlock),
			realSelectionId = 'sel-' + editor.dom.uniqueId(),
			selectedContentEditableNode, $ = editor.$;

		function isBlock(node) {
			return editor.dom.isBlock(node);
		}

		function setRange(range) {
			//console.log('setRange', range);
			if (range) {
				editor.selection.setRng(range);
			}
		}

		function getRange() {
			return editor.selection.getRng();
		}

		function scrollIntoView(node, alignToTop) {
			editor.selection.scrollIntoView(node, alignToTop);
		}

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

			scrollIntoView(node, direction === -1);

			return fakeCaret.show(before, node);
		}

		function selectNode(node) {
			var e;

			fakeCaret.hide();

			e = editor.fire('BeforeObjectSelected', {target: node});
			if (e.isDefaultPrevented()) {
				return null;
			}

			return getNodeRange(node);
		}

		function getNodeRange(node) {
			var rng = node.ownerDocument.createRange();

			rng.selectNode(node);

			return rng;
		}

		function isMoveInsideSameBlock(fromCaretPosition, toCaretPosition) {
			var inSameBlock = CaretUtils.isInSameBlock(fromCaretPosition, toCaretPosition);

			// Handle bogus BR <p>abc|<br></p>
			if (!inSameBlock && NodeType.isBr(fromCaretPosition.getNode())) {
				return true;
			}

			return inSameBlock;
		}

		function getNormalizedRangeEndPoint(direction, range) {
			range = CaretUtils.normalizeRange(direction, rootNode, range);

			if (direction == -1) {
				return CaretPosition.fromRangeStart(range);
			}

			return CaretPosition.fromRangeEnd(range);
		}

		function isRangeInCaretContainerBlock(range) {
			return CaretContainer.isCaretContainerBlock(range.startContainer);
		}

		function moveToCeFalseHorizontally(direction, getNextPosFn, isBeforeContentEditableFalseFn, range) {
			var node, caretPosition, peekCaretPosition, rangeIsInContainerBlock;

			if (!range.collapsed) {
				node = getSelectedNode(range);
				if (isContentEditableFalse(node)) {
					return showCaret(direction, node, direction == -1);
				}
			}

			rangeIsInContainerBlock = isRangeInCaretContainerBlock(range);
			caretPosition = getNormalizedRangeEndPoint(direction, range);

			if (isBeforeContentEditableFalseFn(caretPosition)) {
				return selectNode(caretPosition.getNode(direction == -1));
			}

			caretPosition = getNextPosFn(caretPosition);
			if (!caretPosition) {
				if (rangeIsInContainerBlock) {
					return range;
				}

				return null;
			}

			if (isBeforeContentEditableFalseFn(caretPosition)) {
				return showCaret(direction, caretPosition.getNode(direction == -1), direction == 1);
			}

			// Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
			peekCaretPosition = getNextPosFn(caretPosition);
			if (isBeforeContentEditableFalseFn(peekCaretPosition)) {
				if (isMoveInsideSameBlock(caretPosition, peekCaretPosition)) {
					return showCaret(direction, peekCaretPosition.getNode(direction == -1), direction == 1);
				}
			}

			if (rangeIsInContainerBlock) {
				return renderRangeCaret(caretPosition.toRange());
			}

			return null;
		}

		function moveToCeFalseVertically(direction, walkerFn, range) {
			var caretPosition, linePositions, nextLinePositions,
				closestNextLineRect, caretClientRect, clientX,
				dist1, dist2, contentEditableFalseNode;

			contentEditableFalseNode = getSelectedNode(range);
			caretPosition = getNormalizedRangeEndPoint(direction, range);
			linePositions = walkerFn(rootNode, LineWalker.isAboveLine(1), caretPosition);
			nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));
			caretClientRect = Arr.last(caretPosition.getClientRects());

			if (isBeforeContentEditableFalse(caretPosition)) {
				contentEditableFalseNode = caretPosition.getNode();
			}

			if (isAfterContentEditableFalse(caretPosition)) {
				contentEditableFalseNode = caretPosition.getNode(true);
			}

			if (!caretClientRect) {
				return null;
			}

			clientX = caretClientRect.left;

			closestNextLineRect = LineUtils.findClosestClientRect(nextLinePositions, clientX);
			if (closestNextLineRect) {
				if (isContentEditableFalse(closestNextLineRect.node)) {
					dist1 = Math.abs(clientX - closestNextLineRect.left);
					dist2 = Math.abs(clientX - closestNextLineRect.right);

					return showCaret(direction, closestNextLineRect.node, dist1 < dist2);
				}
			}

			if (contentEditableFalseNode) {
				var caretPositions = LineWalker.positionsUntil(direction, rootNode, LineWalker.isAboveLine(1), contentEditableFalseNode);

				closestNextLineRect = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
				if (closestNextLineRect) {
					return renderRangeCaret(closestNextLineRect.position.toRange());
				}

				closestNextLineRect = Arr.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
				if (closestNextLineRect) {
					return renderRangeCaret(closestNextLineRect.position.toRange());
				}
			}
		}

		function exitPreBlock(direction, range) {
			var pre, caretPos, newBlock;

			function createTextBlock() {
				var textBlock = editor.dom.create(editor.settings.forced_root_block);

				if (!Env.ie || Env.ie >= 11) {
					textBlock.innerHTML = '<br data-mce-bogus="1">';
				}

				return textBlock;
			}

			if (range.collapsed && editor.settings.forced_root_block) {
				pre = editor.dom.getParent(range.startContainer, 'PRE');
				if (!pre) {
					return;
				}

				if (direction == 1) {
					caretPos = getNextVisualCaretPosition(CaretPosition.fromRangeStart(range));
				} else {
					caretPos = getPrevVisualCaretPosition(CaretPosition.fromRangeStart(range));
				}

				if (!caretPos) {
					newBlock = createTextBlock();

					if (direction == 1) {
						editor.$(pre).after(newBlock);
					} else {
						editor.$(pre).before(newBlock);
					}

					editor.selection.select(newBlock, true);
					editor.selection.collapse();
				}
			}
		}

		function moveH(direction, getNextPosFn, isBeforeContentEditableFalseFn, range) {
			var newRange;

			newRange = moveToCeFalseHorizontally(direction, getNextPosFn, isBeforeContentEditableFalseFn, range);
			if (newRange) {
				return newRange;
			}

			newRange = exitPreBlock(direction, range);
			if (newRange) {
				return newRange;
			}

			return null;
		}

		function moveV(direction, walkerFn, range) {
			var newRange;

			newRange = moveToCeFalseVertically(direction, walkerFn, range);
			if (newRange) {
				return newRange;
			}

			newRange = exitPreBlock(direction, range);
			if (newRange) {
				return newRange;
			}

			return null;
		}

		function getBlockCaretContainer() {
			return $('*[data-mce-caret]')[0];
		}

		function showBlockCaretContainer(blockCaretContainer) {
			blockCaretContainer = $(blockCaretContainer);

			if (blockCaretContainer.attr('data-mce-caret')) {
				fakeCaret.hide();
				blockCaretContainer.removeAttr('data-mce-caret');
				blockCaretContainer.removeAttr('data-mce-bogus');
				blockCaretContainer.removeAttr('style');

				// Removes control rect on IE
				setRange(getRange());
				scrollIntoView(blockCaretContainer[0]);
			}
		}

		function renderCaretAtRange(range) {
			var caretPosition, ceRoot;

			range = CaretUtils.normalizeRange(1, rootNode, range);
			caretPosition = CaretPosition.fromRangeStart(range);

			if (isContentEditableFalse(caretPosition.getNode())) {
				return showCaret(1, caretPosition.getNode(), !caretPosition.isAtEnd());
			}

			if (isContentEditableFalse(caretPosition.getNode(true))) {
				return showCaret(1, caretPosition.getNode(true), false);
			}

			// TODO: Should render caret before/after depending on where you click on the page forces after now
			ceRoot = editor.dom.getParent(caretPosition.getNode(), Fun.or(isContentEditableFalse, isContentEditableTrue));
			if (isContentEditableFalse(ceRoot)) {
				return showCaret(1, ceRoot, false);
			}

			fakeCaret.hide();

			return null;
		}

		function renderRangeCaret(range) {
			var caretRange;

			if (!range || !range.collapsed) {
				return range;
			}

			caretRange = renderCaretAtRange(range);
			if (caretRange) {
				return caretRange;
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

		function mergeTextBlocks(direction, fromCaretPosition, toCaretPosition) {
			var dom = editor.dom, fromBlock, toBlock, node, textBlocks;

			if (direction === -1) {
				if (isAfterContentEditableFalse(toCaretPosition) && isBlock(toCaretPosition.getNode(true))) {
					return deleteContentEditableNode(toCaretPosition.getNode(true));
				}
			} else {
				if (isBeforeContentEditableFalse(fromCaretPosition) && isBlock(fromCaretPosition.getNode())) {
					return deleteContentEditableNode(fromCaretPosition.getNode());
				}
			}

			textBlocks = editor.schema.getTextBlockElements();
			fromBlock = dom.getParent(fromCaretPosition.getNode(), dom.isBlock);
			toBlock = dom.getParent(toCaretPosition.getNode(), dom.isBlock);

			// Verify that both blocks are text blocks
			if (fromBlock === toBlock || !textBlocks[fromBlock.nodeName] || !textBlocks[toBlock.nodeName]) {
				return null;
			}

			while ((node = fromBlock.firstChild)) {
				toBlock.appendChild(node);
			}

			editor.dom.remove(fromBlock);

			return toCaretPosition.toRange();
		}

		function backspaceDelete(direction, beforeFn, range) {
			var node, caretPosition, peekCaretPosition;

			if (!range.collapsed) {
				node = getSelectedNode(range);
				if (isContentEditableFalse(node)) {
					return renderRangeCaret(deleteContentEditableNode(node));
				}
			}

			caretPosition = getNormalizedRangeEndPoint(direction, range);

			if (beforeFn(caretPosition)) {
				return renderRangeCaret(deleteContentEditableNode(caretPosition.getNode(direction == -1)));
			}

			peekCaretPosition = direction == -1 ? caretWalker.prev(caretPosition) : caretWalker.next(caretPosition);
			if (beforeFn(peekCaretPosition)) {
				if (direction === -1) {
					return mergeTextBlocks(direction, caretPosition, peekCaretPosition);
				}

				return mergeTextBlocks(direction, peekCaretPosition, caretPosition);
			}
		}

		function registerEvents() {
			var right = curry(moveH, 1, getNextVisualCaretPosition, isBeforeContentEditableFalse);
			var left = curry(moveH, -1, getPrevVisualCaretPosition, isAfterContentEditableFalse);
			var deleteForward = curry(backspaceDelete, 1, isBeforeContentEditableFalse);
			var backspace = curry(backspaceDelete, -1, isAfterContentEditableFalse);
			var up = curry(moveV, -1, LineWalker.upUntil);
			var down = curry(moveV, 1, LineWalker.downUntil);

			function override(evt, moveFn) {
				var range = moveFn(getRange());

				if (range && !evt.isDefaultPrevented()) {
					evt.preventDefault();
					setRange(range);
				}
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

			function isXYWithinRange(clientX, clientY, range) {
				if (range.collapsed) {
					return false;
				}

				return Arr.reduce(range.getClientRects(), function(state, rect) {
					return state || ClientRect.containsXY(rect, clientX, clientY);
				}, false);
			}

			// Some browsers (Chrome) lets you place the caret after a cE=false
			// Make sure we render the caret container in this case
			editor.on('mouseup', function() {
				var range = getRange();

				if (range.collapsed) {
					setRange(renderCaretAtRange(range));
				}
			});

			editor.on('click', function(e) {
				var contentEditableRoot;

				// Prevent clicks on links in a cE=false element
				contentEditableRoot	= getContentEditableRoot(e.target);
				if (contentEditableRoot) {
					if (isContentEditableFalse(contentEditableRoot)) {
						e.preventDefault();
					}
				}
			});

			editor.on('mousedown', function(e) {
				var contentEditableRoot;

				contentEditableRoot	= getContentEditableRoot(e.target);
				if (contentEditableRoot) {
					if (isContentEditableFalse(contentEditableRoot)) {
						e.preventDefault();
						setContentEditableSelection(selectNode(contentEditableRoot));
					} else {
						clearContentEditableSelection();

						if (!isXYWithinRange(e.clientX, e.clientY, editor.selection.getRng())) {
							editor.selection.placeCaretAt(e.clientX, e.clientY);
						}
					}
				} else {
					clearContentEditableSelection();
					fakeCaret.hide();

					var caretInfo = LineUtils.closestCaret(rootNode, e.clientX, e.clientY);
					if (caretInfo) {
						e.preventDefault();
						editor.getBody().focus();
						setRange(showCaret(1, caretInfo.node, caretInfo.before));
					}
				}
			});

			editor.on('keydown', function(e) {
				if (VK.modifierPressed(e)) {
					return;
				}

				switch (e.keyCode) {
					case VK.RIGHT:
						override(e, right);
						break;

					case VK.DOWN:
						override(e, down);
						break;

					case VK.LEFT:
						override(e, left);
						break;

					case VK.UP:
						override(e, up);
						break;

					case VK.DELETE:
						override(e, deleteForward);
						break;

					case VK.BACKSPACE:
						override(e, backspace);
						break;

					default:
						if (isContentEditableFalse(editor.selection.getNode())) {
							e.preventDefault();
						}
						break;
				}
			});

			function paddEmptyContentEditableArea() {
				var br, ceRoot = getContentEditableRoot(editor.selection.getNode());

				if (isContentEditableTrue(ceRoot) && isBlock(ceRoot) && editor.dom.isEmpty(ceRoot)) {
					br = editor.dom.create('br', {"data-mce-bogus": "1"});
					editor.$(ceRoot).empty().append(br);
					editor.selection.setRng(CaretPosition.before(br).toRange());
				}
			}

			function handleBlockContainer(e) {
				var blockCaretContainer = getBlockCaretContainer();

				if (!blockCaretContainer) {
					return;
				}

				if (e.type == 'compositionstart') {
					e.preventDefault();
					e.stopPropagation();
					showBlockCaretContainer(blockCaretContainer);
					return;
				}

				if (blockCaretContainer.innerHTML != '&nbsp;') {
					showBlockCaretContainer(blockCaretContainer);
				}
			}

			function handleEmptyBackspaceDelete(e) {
				var prevent;

				switch (e.keyCode) {
					case VK.DELETE:
						prevent = paddEmptyContentEditableArea();
						break;

					case VK.BACKSPACE:
						prevent = paddEmptyContentEditableArea();
						break;
				}

				if (prevent) {
					e.preventDefault();
				}
			}

			// Must be added to "top" since undoManager needs to be executed after
			editor.on('keyup compositionstart', function(e) {
				handleBlockContainer(e);
				handleEmptyBackspaceDelete(e);
			}, true);

			editor.on('cut', function() {
				var node = editor.selection.getNode();

				if (isContentEditableFalse(node)) {
					Delay.setEditorTimeout(editor, function() {
						setRange(renderRangeCaret(deleteContentEditableNode(node)));
					});
				}
			});

			editor.on('getSelectionRange', function(e) {
				var rng = e.range;

				if (selectedContentEditableNode) {
					if (!selectedContentEditableNode.parentNode) {
						selectedContentEditableNode = null;
						return;
					}

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

			editor.on('focus', function() {
				// Make sure we have a proper fake caret on focus
				Delay.setEditorTimeout(editor, function() {
					editor.selection.setRng(renderRangeCaret(editor.selection.getRng()));
				}, 0);
			});

			DragDropOverrides.init(editor);
		}

		function addCss() {
			var styles = editor.contentStyles, rootClass = '.mce-content-body';

			styles.push(fakeCaret.getCss());
			styles.push(
				rootClass + ' .mce-offscreen-selection {' +
					'position: absolute;' +
					'left: -9999999999px;' +
					'width: 100px;' +
					'height: 100px;' +
				'}' +
				rootClass + ' *[contentEditable=false] {' +
					'cursor: default;' +
				'}' +
				rootClass + ' *[contentEditable=true] {' +
					'cursor: text;' +
				'}'
			);
		}

		function isRangeInCaretContainer(rng) {
			return CaretContainer.isCaretContainer(rng.startContainer) || CaretContainer.isCaretContainer(rng.endContainer);
		}

		function setContentEditableSelection(range) {
			var node, $ = editor.$, dom = editor.dom, $realSelectionContainer, sel,
				startContainer, startOffset, endOffset, e, caretPosition, targetClone, origTargetClone;

			if (!range) {
				clearContentEditableSelection();
				return null;
			}

			if (range.collapsed) {
				clearContentEditableSelection();

				if (!isRangeInCaretContainer(range)) {
					caretPosition = getNormalizedRangeEndPoint(1, range);

					if (isContentEditableFalse(caretPosition.getNode())) {
						return showCaret(1, caretPosition.getNode(), !caretPosition.isAtEnd());
					}

					if (isContentEditableFalse(caretPosition.getNode(true))) {
						return showCaret(1, caretPosition.getNode(true), false);
					}
				}

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

			if (!isContentEditableFalse(node)) {
				clearContentEditableSelection();
				return null;
			}

			targetClone = origTargetClone = node.cloneNode(true);
			e = editor.fire('ObjectSelected', {target: node, targetClone: targetClone});
			if (e.isDefaultPrevented()) {
				clearContentEditableSelection();
				return null;
			}

			targetClone = e.targetClone;
			$realSelectionContainer = $('#' + realSelectionId);
			if ($realSelectionContainer.length === 0) {
				$realSelectionContainer = $(
					'<div data-mce-bogus="all" class="mce-offscreen-selection"></div>'
				).attr('id', realSelectionId);

				$realSelectionContainer.appendTo(editor.getBody());
			}

			range = editor.dom.createRng();

			// WHY is IE making things so hard! Copy on <i contentEditable="false">x</i> produces: <em>x</em>
			if (targetClone === origTargetClone && Env.ie) {
				$realSelectionContainer.empty().append(Zwsp.ZWSP).append(targetClone).append(Zwsp.ZWSP);
				range.setStart($realSelectionContainer[0].firstChild, 0);
				range.setEnd($realSelectionContainer[0].lastChild, 1);
			} else {
				$realSelectionContainer.empty().append('\u00a0').append(targetClone).append('\u00a0');
				range.setStart($realSelectionContainer[0].firstChild, 1);
				range.setEnd($realSelectionContainer[0].lastChild, 0);
			}

			$realSelectionContainer.css({
				top: dom.getPos(node, editor.getBody()).y
			});

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

		if (Env.ceFalse) {
			registerEvents();
			addCss();
		}

		return {
			showBlockCaretContainer: showBlockCaretContainer,
			destroy: destroy
		};
	}

	return SelectionOverrides;
});
