/**
 * Resize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce.modern.ui.Resize', [
	'global!tinymce.DOM'
], function (DOM) {
	var getSize = function (elm) {
		return {
			width: elm.clientWidth,
			height: elm.clientHeight
		};
	};

	var resizeTo = function (editor, width, height) {
		var containerElm, iframeElm, containerSize, iframeSize, settings = editor.settings;

		containerElm = editor.getContainer();
		iframeElm = editor.getContentAreaContainer().firstChild;
		containerSize = getSize(containerElm);
		iframeSize = getSize(iframeElm);

		if (width !== null) {
			width = Math.max(settings.min_width || 100, width);
			width = Math.min(settings.max_width || 0xFFFF, width);

			DOM.setStyle(containerElm, 'width', width + (containerSize.width - iframeSize.width));
			DOM.setStyle(iframeElm, 'width', width);
		}

		height = Math.max(settings.min_height || 100, height);
		height = Math.min(settings.max_height || 0xFFFF, height);
		DOM.setStyle(iframeElm, 'height', height);

		editor.fire('ResizeEditor');
	};

	var resizeBy = function (editor, dw, dh) {
		var elm = editor.getContentAreaContainer();
		resizeTo(editor, elm.clientWidth + dw, elm.clientHeight + dh);
	};

	return {
		resizeTo: resizeTo,
		resizeBy: resizeBy
	};
});
