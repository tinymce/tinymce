/**
 * Measure.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/Measure', [
	'global!tinymce.DOM',
	'global!tinymce.geom.Rect',
	'tinymce/inlight/core/Convert'
], function (DOM, Rect, Convert) {
	var toAbsolute = function (rect) {
		var vp = DOM.getViewPort();

		return {
			x: rect.x + vp.x,
			y: rect.y + vp.y,
			w: rect.w,
			h: rect.h
		};
	};

	var getElementRect = function (editor, elm) {
		var pos, targetRect, root;

		pos = DOM.getPos(editor.getContentAreaContainer());
		targetRect = editor.dom.getRect(elm);
		root = editor.dom.getRoot();

		// Adjust targetPos for scrolling in the editor
		if (root.nodeName == 'BODY') {
			targetRect.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
			targetRect.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
		}

		targetRect.x += pos.x;
		targetRect.y += pos.y;

		// We need to use these instead of the rect values since the style
		// size properites might not be the same as the real size for a table
		targetRect.w = elm.clientWidth;
		targetRect.h = elm.clientHeight;

		return targetRect;
	};

	var getPageAreaRect = function (editor) {
		return DOM.getRect(editor.getElement().ownerDocument.body);
	};

	var getContentAreaRect = function (editor) {
		return toAbsolute(DOM.getRect(editor.getContentAreaContainer() || editor.getBody()));
	};

	var getSelectionRect = function (editor) {
		var clientRect = editor.selection.getBoundingClientRect();
		return clientRect ? toAbsolute(Convert.fromClientRect(clientRect)) : null;
	};

	return {
		getElementRect: getElementRect,
		getPageAreaRect: getPageAreaRect,
		getContentAreaRect: getContentAreaRect,
		getSelectionRect: getSelectionRect
	};
});
