/**
 * FakeCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for rendering a fake visual caret.
 *
 * @private
 * @class tinymce.caret.FakeCaret
 */
define("tinymce/caret/FakeCaret", [
	"tinymce/caret/CaretContainer",
	"tinymce/caret/CaretPosition",
	"tinymce/dom/NodeType",
	"tinymce/dom/RangeUtils",
	"tinymce/dom/DomQuery",
	"tinymce/geom/ClientRect",
	"tinymce/util/Delay"
], function(CaretContainer, CaretPosition, NodeType, RangeUtils, $, ClientRect, Delay) {
	var isBlock = NodeType.matchStyleValues('display', 'block'),
		isContentEditableFalse = NodeType.isContentEditableFalse;

	return function(rootNode) {
		var cursorInterval, $lastVisualCaret, caretContainerNode, info, lastClientRect;

		function getAbsoluteClientRect(node, before) {
			var clientRect = ClientRect.collapse(node.getBoundingClientRect(), before),
				docElm, scrollX, scrollY;

			scrollX = rootNode.scrollLeft;
			scrollY = rootNode.scrollTop;

			if (rootNode.tagName == 'BODY') {
				docElm = rootNode.ownerDocument.documentElement;
				scrollX = scrollX || docElm.scrollLeft;
				scrollY = scrollY || docElm.scrollTop;
			}

			clientRect.left += scrollX;
			clientRect.right += scrollX;
			clientRect.top += scrollY;
			clientRect.bottom += scrollY;
			clientRect.width = 1;

			return clientRect;
		}

		function trimInlineCaretContainers() {
			var contentEditableFalseNodes, node, sibling, i, data;

			contentEditableFalseNodes = $('*[contentEditable=false]', rootNode);
			for (i = 0; i < contentEditableFalseNodes.length; i++) {
				node = contentEditableFalseNodes[i];

				sibling = node.previousSibling;
				if (CaretContainer.endsWithCaretContainer(sibling)) {
					data = sibling.data;

					if (data.length == 1) {
						sibling.parentNode.removeChild(sibling);
					} else {
						sibling.deleteData(data.length - 1, 1);
					}
				}

				sibling = node.nextSibling;
				if (CaretContainer.startsWithCaretContainer(sibling)) {
					data = sibling.data;

					if (data.length == 1) {
						sibling.parentNode.removeChild(sibling);
					} else {
						sibling.deleteData(0, 1);
					}
				}
			}

			return null;
		}

		function show(direction, node, before) {
			var clientRect, rng, contentEditableSibling, container;

			if (typeof before === "undefined") {
				before = direction == 1;
			}

			hide();

			if (!before && direction == 1 && isContentEditableFalse(node.nextSibling)) {
				contentEditableSibling = node.nextSibling;
			}

			if (before && direction == -1 && isContentEditableFalse(node.previousSibling)) {
				contentEditableSibling = node.previousSibling;
			}

			if (isBlock(node)) {
				caretContainerNode = CaretContainer.insertBlock('p', node, before);
				clientRect = getAbsoluteClientRect(node, before);
				lastClientRect = clientRect;
				$(caretContainerNode).css('top', clientRect.top);

				$lastVisualCaret = $('<div class="mce-visual-caret" data-mce-bogus="all"></div>').css(clientRect).appendTo(rootNode);

				if (before) {
					$lastVisualCaret.addClass('mce-visual-caret-before');
				}

				startBlink();
			} else {
				container = CaretContainer.insertInline(node, before);
				rng = node.ownerDocument.createRange();

				if (isContentEditableFalse(container.nextSibling)) {
					rng.setStart(container, 0);
					rng.setEnd(container, 0);
				} else {
					rng.setStart(container, 1);
					rng.setEnd(container, 1);
				}

				return rng;
			}

			rng = node.ownerDocument.createRange();
			container = caretContainerNode.firstChild;
			rng.setStart(container, 0);
			rng.setEnd(container, 1);

			if (isBlock(contentEditableSibling)) {
				info = {
					direction: direction,
					node: contentEditableSibling,
					container: container
				};
			} else {
				info = null;
			}

			return rng;
		}

		function hide() {
			info = lastClientRect = null;

			trimInlineCaretContainers();

			if (caretContainerNode) {
				CaretContainer.remove(caretContainerNode);
				caretContainerNode = null;
			}

			if ($lastVisualCaret) {
				$lastVisualCaret.remove();
				$lastVisualCaret = null;
			}

			clearInterval(cursorInterval);
		}

		function startBlink() {
			cursorInterval = Delay.setInterval(function() {
				$('div.mce-visual-caret', rootNode).toggleClass('mce-visual-caret-hidden');
			}, 500);
		}

		function showPendingCaret(direction, range) {
			if (!info) {
				return null;
			}

			if (range.startContainer != range.endContainer || range.startContainer != info.container) {
				return false;
			}

			if (direction == info.direction) {
				if (direction == -1) {
					return show(1, info.node, false);
				}

				return show(-1, info.node, true);
			}
		}

		function getClientRect() {
			return lastClientRect;
		}

		function destroy() {
			Delay.clearInterval(cursorInterval);
		}

		function getCss() {
			return (
				'.mce-visual-caret {' +
					'position: absolute;' +
					'background-color: black;' +
					'background-color: currentcolor;' +
				'}' +
				'.mce-visual-caret-hidden {' +
					'display: none;' +
				'}' +
				'*[data-mce-caret] {' +
					'position: absolute;' +
					'left: -1000px;' +
					'right: auto;' +
					'top: 0;' +
					'margin: 0;' +
					'padding: 0;' +
				'}'
			);
		}

		return {
			show: show,
			hide: hide,
			showPendingCaret: showPendingCaret,
			getClientRect: getClientRect,
			getCss: getCss,
			destroy: destroy
		};
	};
});