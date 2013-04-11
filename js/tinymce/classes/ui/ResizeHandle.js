/**
 * ResizeHandle.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less ResizeHandle.less
 * @class tinymce.ui.ResizeHandle
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/ResizeHandle", [
	"tinymce/ui/Widget",
	"tinymce/ui/DragHelper",
	"tinymce/ui/DomUtils"
], function(Widget, DragHelper, DomUtils) {
	"use strict";

	return Widget.extend({
		renderHtml: function() {
			var self = this, prefix = self.classPrefix;

			self.addClass('resizehandle');

			if (self.settings.both) {
				self.addClass('resizehandle-both');
			}

			self.canFocus = false;

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '"><i class="' + prefix + 'ico ' +
				prefix + 'i-resize"></i></div>'
			);
		},

		postRender: function() {
			var self = this, iframeStartSize, editor = self.settings.editor;

			self._super();

			function getSize(elm) {
				return {
					width: elm.clientWidth,
					height: elm.clientHeight
				};
			}

			function resizeIframe(width, height) {
				var containerElm, iframeElm, containerSize, iframeSize, settings = editor.settings;

				containerElm = editor.getContainer();
				iframeElm = editor.getContentAreaContainer().firstChild;
				containerSize = getSize(containerElm);
				iframeSize = getSize(iframeElm);

				width = Math.max(settings.min_width || 100, width);
				height = Math.max(settings.min_height || 100, height);
				width = Math.min(settings.max_width || 0xFFFF, width);
				height = Math.min(settings.max_height || 0xFFFF, height);

				if (self.settings.both) {
					DomUtils.css(containerElm, 'width', width + (containerSize.width - iframeSize.width));
				}

				DomUtils.css(containerElm, 'height', height + (containerSize.height - iframeSize.height));

				if (self.settings.both) {
					DomUtils.css(iframeElm, 'width', width);
				}

				DomUtils.css(iframeElm, 'height', height);

				editor.fire('ResizeEditor');
			}

			self.resizeDragHelper = new DragHelper(this._id, {
				start: function() {
					iframeStartSize = getSize(editor.getContentAreaContainer().firstChild);
				},

				drag: function(evt) {
					resizeIframe(iframeStartSize.width + evt.deltaX, iframeStartSize.height + evt.deltaY);
				},

				end: function() {
				}
			});
		}
	});
});