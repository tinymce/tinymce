/**
 * DragDropOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic overriding the drag/drop logic of the editor.
 *
 * @private
 * @class tinymce.DragDropOverrides
 */
define("tinymce/DragDropOverrides", [
	"tinymce/dom/NodeType",
	"tinymce/util/Arr",
	"tinymce/util/Fun"
], function(
	NodeType,
	Arr,
	Fun
) {
	var isContentEditableFalse = NodeType.isContentEditableFalse,
		isContentEditableTrue = NodeType.isContentEditableTrue;

	function init(editor) {
		var $ = editor.$, rootDocument = document,
			editableDoc = editor.getDoc(),
			dom = editor.dom, state = {};

		function isDraggable(elm) {
			return isContentEditableFalse(elm);
		}

		function setBodyCursor(cursor) {
			$(editor.getBody()).css('cursor', cursor);
		}

		function isValidDropTarget(elm) {
			if (elm == state.element || editor.dom.isChildOf(elm, state.element)) {
				return false;
			}

			if (isContentEditableFalse(elm)) {
				return false;
			}

			return true;
		}

		function move(e) {
			var deltaX, deltaY, pos, viewPort,
				overflowX = 0, overflowY = 0, movement,
				clientX, clientY, rootClientRect;

			if (e.button !== 0) {
				return;
			}

			deltaX = e.screenX - state.screenX;
			deltaY = e.screenY - state.screenY;
			movement = Math.max(Math.abs(deltaX), Math.abs(deltaY));

			if (!state.dragging && movement > 10) {
				state.dragging = true;
				setBodyCursor('default');

				state.clone = state.element.cloneNode(true);

				pos = dom.getPos(state.element);
				state.relX = state.clientX - pos.x;
				state.relY = state.clientY - pos.y;
				state.width = state.element.offsetWidth;
				state.height = state.element.offsetHeight;

				$(state.clone).css({
					width: state.width,
					height: state.height
				}).removeAttr('data-mce-selected');

				state.ghost = $('<div>').css({
					position: 'absolute',
					opacity: 0.5,
					overflow: 'hidden',
					width: state.width,
					height: state.height
				}).attr({
					'data-mce-bogus': 'all',
					unselectable: 'on',
					contenteditable: 'false'
				}).addClass('mce-drag-container mce-reset').
					append(state.clone).
					appendTo(editor.getBody())[0];

				viewPort = editor.dom.getViewPort(editor.getWin());
				state.maxX = viewPort.w;
				state.maxY = viewPort.h;
			}

			if (state.dragging) {
				editor.selection.placeCaretAt(e.clientX, e.clientY);

				clientX = state.clientX + deltaX - state.relX;
				clientY = state.clientY + deltaY + 5;

				if (clientX + state.width > state.maxX) {
					overflowX = (clientX + state.width) - state.maxX;
				}

				if (clientY + state.height > state.maxY) {
					overflowY = (clientY + state.height) - state.maxY;
				}

				if (editor.getBody().nodeName != 'BODY') {
					rootClientRect = editor.getBody().getBoundingClientRect();
				} else {
					rootClientRect = {left: 0, top: 0};
				}

				$(state.ghost).css({
					left: clientX - rootClientRect.left,
					top: clientY - rootClientRect.top,
					width: state.width - overflowX,
					height: state.height - overflowY
				});
			}
		}

		function drop() {
			if (state.dragging) {
				// Hack for IE since it doesn't sync W3C Range with IE Specific range
				editor.selection.setRng(editor.selection.getSel().getRangeAt(0));

				if (isValidDropTarget(editor.selection.getNode())) {
					editor.undoManager.transact(function() {
						editor.insertContent(dom.getOuterHTML(state.element));
						$(state.element).remove();
					});
				}
			}

			stop();
		}

		function start(e) {
			var ceElm;

			stop();

			if (e.button !== 0) {
				return;
			}

			ceElm = Arr.find(editor.dom.getParents(e.target), Fun.or(isContentEditableFalse, isContentEditableTrue));

			if (isDraggable(ceElm)) {
				if (editor.fire('dragstart', {target: ceElm}).isDefaultPrevented()) {
					return;
				}

				editor.on('mousemove', move);
				editor.on('mouseup', drop);

				if (rootDocument != editableDoc) {
					dom.bind(rootDocument, 'mousemove', move);
					dom.bind(rootDocument, 'mouseup', drop);
				}

				state = {
					screenX: e.screenX,
					screenY: e.screenY,
					clientX: e.clientX,
					clientY: e.clientY,
					element: ceElm
				};
			}
		}

		function stop() {
			$(state.ghost).remove();
			setBodyCursor(null);

			editor.off('mousemove', move);
			editor.off('mouseup', stop);

			if (rootDocument != editableDoc) {
				dom.unbind(rootDocument, 'mousemove', move);
				dom.unbind(rootDocument, 'mouseup', stop);
			}

			state = {};
		}

		editor.on('mousedown', start);

		// Blocks drop inside cE=false on IE
		editor.on('drop', function(e) {
			var realTarget = editor.getDoc().elementFromPoint(e.clientX, e.clientY);

			if (isContentEditableFalse(realTarget) || isContentEditableFalse(editor.dom.getContentEditableParent(realTarget))) {
				e.preventDefault();
			}
		});
	}

	return {
		init: init
	};
});
