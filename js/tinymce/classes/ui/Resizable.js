/**
 * Resizable.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

define("tinymce/ui/Resizable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	return {
		resizeToContent: function() {
			this._layoutRect.autoResize = true;
			this._lastRect = null;
			this.reflow();
		},

		resizeTo: function(w, h) {
			// TODO: Fix hack
			if (w <= 1 || h <= 1) {
				var rect = DomUtils.getWindowSize();

				w = w <= 1 ? w * rect.w : w;
				h = h <= 1 ? h * rect.h : h;
			}

			this._layoutRect.autoResize = false;
			return this.layoutRect({minW: w, minH: h, w: w, h: h}).reflow();
		},

		resizeBy: function(dw, dh) {
			var self = this, rect = self.layoutRect();

			return self.resizeTo(rect.w + dw, rect.h + dh);
		}
	};
});