/**
 * AbsoluteLayout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less AbsoluteLayout.less
 * @class tinymce.ui.AbsoluteLayout
 * @extends tinymce.ui.Layout
 */
define("tinymce/ui/AbsoluteLayout", [
	"tinymce/ui/Layout"
], function(Layout) {
	"use strict";

	return Layout.extend({
		Defaults: {
			containerClass: 'abs-layout',
			controlClass: 'abs-layout-item'
		},

		recalc: function(container) {
			container.items().filter(':visible').each(function(ctrl) {
				var settings = ctrl.settings;

				ctrl.layoutRect({
					x: settings.x,
					y: settings.y,
					w: settings.w,
					h: settings.h
				});

				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		},

		renderHtml: function(container) {
			return '<div id="' + container._id + '-absend" class="' + container.classPrefix + 'abs-end"></div>' + this._super(container);
		}
	});
});