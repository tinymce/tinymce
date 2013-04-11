/**
 * FitLayout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * This class jada jada.
 *
 *     var x = 3;
 *
 * @-x-less FitLayout.less
 * @class tinymce.ui.FitLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/FitLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		recalc: function(container) {
			var contLayoutRect = container.layoutRect(), paddingBox = container.paddingBox();

			container.items().filter(':visible').each(function(ctrl) {
				ctrl.layoutRect({
					x: paddingBox.left,
					y: paddingBox.top,
					w: contLayoutRect.innerW - paddingBox.right - paddingBox.left,
					h: contLayoutRect.innerH - paddingBox.top - paddingBox.bottom
				});

				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		}
	});
});